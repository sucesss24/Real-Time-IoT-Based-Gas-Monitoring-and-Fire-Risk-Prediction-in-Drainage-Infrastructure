import firebase_admin
from firebase_admin import credentials, db
import joblib
import pandas as pd
import numpy as np
import time
from datetime import datetime

# ==============================
# LOAD TRAINED MODEL
# ==============================

model = joblib.load("fire_prediction_pipeline.pkl")

FEATURES = ["mq2", "mq135", "mq7", "temp", "hum"]

# ==============================
# FIREBASE CONNECTION
# ==============================

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
      "databaseURL": "https://mq-135-a4442-default-rtdb.firebaseio.com/"
})

sensor_ref = db.reference("readings")
prediction_ref = db.reference("prediction")

print("🔥 Multi-Sensor Fire Detection Started...")

# ==============================
# MAIN LOOP
# ==============================

while True:
    try:
        all_sensors = sensor_ref.get()

        if not all_sensors:
            print("Waiting for sensor data...")
            time.sleep(2)
            continue

        for sensor_id, data in all_sensors.items():

            try:
                mq2 = float(data.get("mq2", 0))
                mq135 = float(data.get("mq135", 0))
                mq7 = float(data.get("mq7", 0))
                temp = float(data.get("temp", 0))
                hum = float(data.get("hum", 0))

                df = pd.DataFrame([[mq2, mq135, mq7, temp, hum]], columns=FEATURES)

                probability = model.predict_proba(df)[0][1]

                # ==============================
                # FIRE STATUS LOGIC
                # ==============================

                if probability >= 0.75:
                    fire_status = "FIRE ALERT"
                elif probability >= 0.4:
                    fire_status = "WARNING"
                else:
                    fire_status = "SAFE"

                timestamp = datetime.now().strftime("%H:%M:%S")

                print(f"{sensor_id} | {fire_status} | {probability:.2f}")

                # ==============================
                # STORE PREDICTION PER SENSOR
                # ==============================

                prediction_ref.child(sensor_id).set({
                    "fire_status": fire_status,
                    "probability": round(probability, 3),
                    "mq2": mq2,
                    "mq135": mq135,
                    "mq7": mq7,
                    "temperature": temp,
                    "humidity": hum,
                    "time": timestamp
                })

            except Exception as sensor_error:
                print(f"Error processing {sensor_id}:", sensor_error)

        time.sleep(3)

    except Exception as e:
        print("Global Error:", e)
        time.sleep(3)