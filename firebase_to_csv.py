import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import time
from datetime import datetime
import os

# 🔐 Use same Firebase key
cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://mq-135-a4442-default-rtdb.firebaseio.com/"
})

readings_ref = db.reference("readings")
prediction_ref = db.reference("prediction")

file_name = "sensor_data.csv"

print("CSV Logger Started...\n")

while True:
    try:
        readings = readings_ref.get()
        predictions = prediction_ref.get()

        if not readings:
            print("No data...")
            time.sleep(3)
            continue

        rows = []

        for sensor_id, values in readings.items():

            pred = predictions.get(sensor_id, {}) if predictions else {}

            row = {
                "sensor_id": sensor_id,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "mq2": values.get("mq2", 0),
                "mq135": values.get("mq135", 0),
                "mq7": values.get("mq7", 0),
                "temp": values.get("temp", 0),
                "hum": values.get("hum", 0),
                "fire_status": pred.get("fire_status", "NA"),
                "probability": pred.get("probability", 0),
                "toxic_level": pred.get("toxic_level", "NA"),
                "gas_avg": pred.get("gas_average", 0)
            }

            rows.append(row)

        df = pd.DataFrame(rows)

        # Append or create file
        if not os.path.isfile(file_name):
            df.to_csv(file_name, index=False)
        else:
            df.to_csv(file_name, mode='a', header=False, index=False)

        print("Data written to CSV")

        time.sleep(5)

    except Exception as e:
        print("Error:", e)
        time.sleep(5)