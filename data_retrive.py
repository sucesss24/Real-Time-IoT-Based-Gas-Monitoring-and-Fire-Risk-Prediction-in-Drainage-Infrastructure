import firebase_admin
from firebase_admin import credentials, db
import time
from datetime import datetime
import smtplib
from email.message import EmailMessage

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": ""
})

readings_ref = db.reference("readings")
prediction_ref = db.reference("prediction")

print("Tunnel Fire & Toxic Gas Monitoring Started...\n")


SENDER_EMAIL = "miniproject2k26mail@gmail.com"
SENDER_PASSWORD = "ldjo ivpa cdwb gpeb"

ADMIN_EMAILS = [
    "saravanakumar26062006@gmail.com",
    "71762305050@cit.edu.in",
    "71762305062@cit.edu.in"
]

# ==============================
def send_bulk_alert(subject, body, recipients):
    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = ", ".join(recipients)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)

        print("Email alert sent successfully!")

    except Exception as e:
        print("Email sending failed:", e)

def predict_fire(mq2, mq135, mq7, temp, hum):
    score = (
        (mq2 / 1000) * 0.3 +
        (mq135 / 1000) * 0.3 +
        (mq7 / 1000) * 0.2 +
        (temp / 100) * 0.15 +
        (hum / 100) * 0.05
    )

    probability = round(min(score, 1.0), 2)

    if probability < 0.40:
        return "SAFE", probability
    elif probability < 0.70:
        return "WARNING", probability
    else:
        return "FIRE ALERT", probability

def toxic_level(mq2, mq135, mq7):
    gas_avg = (mq2 + mq135 + mq7) / 3

    if gas_avg < 200:
        return "SAFE", gas_avg
    elif gas_avg < 400:
        return "MODERATE", gas_avg
    elif gas_avg < 700:
        return "HIGH", gas_avg
    else:
        return "CRITICAL", gas_avg


while True:
    try:
        sensors_data = readings_ref.get()

        if not sensors_data:
            print("No sensor data found...")
            time.sleep(3)
            continue

        print("\n========== Tunnel Status ==========")

        for sensor_id, values in sensors_data.items():

            mq2 = values.get("mq2", 0)
            mq135 = values.get("mq135", 0)
            mq7 = values.get("mq7", 0)
            temp = values.get("temp", 0)
            hum = values.get("hum", 0)

            fire_status, probability = predict_fire(mq2, mq135, mq7, temp, hum)
            toxic_status, gas_avg = toxic_level(mq2, mq135, mq7)

            print(f"\nSensor ID : {sensor_id}")

            print("  Sensor Readings:")
            print(f"  MQ2 Gas Sensor     : {mq2}")
            print(f"  MQ135 Air Sensor   : {mq135}")
            print(f"  MQ7 CO Sensor      : {mq7}")
            print(f"  Temperature        : {temp} °C")
            print(f"  Humidity           : {hum} %")

            print("\n  Prediction:")
            print(f"  Fire Status        : {fire_status} ({probability})")
            print(f"  Toxic Level        : {toxic_status}")
            print("")

            current_alert = prediction_ref.child(sensor_id).child("alert_sent").get() or False

            prediction_ref.child(sensor_id).set({
                "fire_status": fire_status,
                "probability": probability,
                "toxic_level": toxic_status,
                "gas_average": round(gas_avg, 2),
                "temperature": temp,
                "humidity": hum,
                "time": datetime.now().strftime("%H:%M:%S"),
                "alert_sent": current_alert
            })

           
            if fire_status == "SAFE" or toxic_status in ["MODERATE", "CRITICAL"]:

                if not current_alert:

                    message_body = f"""
TUNNEL ALERT : {sensor_id}

Fire Status : {fire_status} ({probability})
Toxic Level : {toxic_status} (Avg Gas : {round(gas_avg,2)})

Temperature : {temp} °C
Humidity : {hum} %

Time : {datetime.now().strftime('%H:%M:%S')}
"""

                    send_bulk_alert(" Tunnel Emergency Alert", message_body, ADMIN_EMAILS)

                    prediction_ref.child(sensor_id).update({"alert_sent": True})

                    print("  ALERT EMAIL SENT")

            else:
                prediction_ref.child(sensor_id).update({"alert_sent": False})

        print("====================================")
        time.sleep(3)

    except Exception as e:
        print("Error:", e)

        time.sleep(3)
