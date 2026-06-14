import firebase_admin
from firebase_admin import credentials, db
import time
from datetime import datetime
import smtplib
from email.message import EmailMessage
import psycopg2

# ==============================
# FIREBASE SETUP
# ==============================
cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://mq-135-a4442-default-rtdb.firebaseio.com/"
    })

readings_ref = db.reference("readings")
prediction_ref = db.reference("prediction")

print(" Tunnel Monitoring System Started...\n")

# ==============================
# POSTGRESQL CONNECTION
# ==============================
conn = psycopg2.connect(
    host="localhost",
    database="tunnel_monitor",
    user="postgres",
    password="postgres"
)

cursor = conn.cursor()

print(" PostgreSQL Connected!\n")

# ==============================
# EMAIL CONFIG
# ==============================
SENDER_EMAIL = "miniproject2k26mail@gmail.com"

# Gmail App Password
SENDER_PASSWORD = "kpby ycti oour ehcu"

ADMIN_EMAILS = [
    "71762305062@cit.edu.in",
    "71762305050@cit.edu.in"
]

# ==============================
# SEND EMAIL
# ==============================
def send_alert(subject, body, recipients):

    try:

        msg = EmailMessage()

        msg.set_content(body)

        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = ", ".join(recipients)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:

            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)

        print(" Alert Email Sent!")

    except Exception as e:

        print("Email Error:", e)

# ==============================
# SAFE FLOAT
# ==============================
def safe_float(val):

    try:
        return float(val)

    except:
        return 0.0

# ==============================
# FIRE PREDICTION
# ==============================
def predict_fire(mq2, mq135, mq7, temp, hum):

    # ==========================
    # DIRECT FIRE THRESHOLD
    # ==========================
    if (
        mq2 > 600 or
        mq135 > 700 or
        mq7 > 550
    ):

        return "FIRE ALERT", 0.95

    # ==========================
    # NORMAL SCORE CALCULATION
    # ==========================
    score = (
        (mq2 / 1000) * 0.3 +
        (mq135 / 1000) * 0.3 +
        (mq7 / 1000) * 0.2 +
        (temp / 100) * 0.15 +
        (hum / 100) * 0.05
    )

    probability = round(min(score, 1.0), 2)

    # ==========================
    # STATUS CHECK
    # ==========================
    if probability < 0.40:

        return "SAFE", probability

    elif probability < 0.70:

        return "WARNING", probability

    else:

        return "FIRE ALERT", probability

# ==============================
# TOXIC LEVEL
# ==============================
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

# ==============================
# SAVE TO DATABASE
# ==============================
def save_db(
    sensor_id,
    mq2,
    mq135,
    mq7,
    temp,
    hum,
    fire_status,
    probability,
    toxic_status,
    gas_avg,
    lat,
    lng
):

    try:

        query = """
        INSERT INTO sensor_readings (
            sensor_id,
            mq2,
            mq135,
            mq7,
            temperature,
            humidity,
            fire_status,
            probability,
            toxic_level,
            gas_average,
            latitude,
            longitude
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            sensor_id,
            mq2,
            mq135,
            mq7,
            temp,
            hum,
            fire_status,
            probability,
            toxic_status,
            gas_avg,
            lat,
            lng
        )

        cursor.execute(query, values)

        conn.commit()

        print("Saved to PostgreSQL")

    except Exception as e:

        print("Database Error:", e)

# ==============================
# MAIN LOOP
# ==============================
while True:

    try:

        readings = readings_ref.get()

        if not readings:

            print("No Sensor Data Found...")
            time.sleep(3)
            continue

        print("\n========== TUNNEL STATUS ==========")

        for sensor_id, values in readings.items():

            # Skip sensor3
            if sensor_id.lower() == "sensor3":
                continue

            sensor_id = sensor_id.lower()

            # ==========================
            # SENSOR VALUES
            # ==========================
            mq2 = values.get("mq2")
            mq135 = values.get("mq135")
            mq7 = values.get("mq7")
            temp = values.get("temp")
            hum = values.get("hum")

            location = values.get(
                "location",
                "Unknown Location"
            )

            # ==========================
            # GPS VALUES
            # ==========================
            lat = safe_float(
                values.get("latitude")
            )

            lng = safe_float(
                values.get("longitude")
            )

            # ==========================
            # CHECK MISSING DATA
            # ==========================
            if None in [mq2, mq135, mq7, temp, hum]:

                print(f"{sensor_id} Missing Data")
                continue

            # ==========================
            # PREDICTION
            # ==========================
            fire_status, probability = predict_fire(
                mq2,
                mq135,
                mq7,
                temp,
                hum
            )

            toxic_status, gas_avg = toxic_level(
                mq2,
                mq135,
                mq7
            )

            # ==========================
            # DISPLAY OUTPUT
            # ==========================
            print(f"\nSensor: {sensor_id}")

            print(f"Location: {location}")

            print(f"GPS: ({lat}, {lng})")

            print(
                f"MQ2:{mq2} MQ135:{mq135} MQ7:{mq7}"
            )

            print(
                f"Temp:{temp}°C Humidity:{hum}%"
            )

            print(
                f"Fire: {fire_status} ({probability})"
            )

            print(
                f"Toxic: {toxic_status}"
            )

            # ==========================
            # ALERT LOGIC
            # ==========================
            is_danger = (
                fire_status != "SAFE"
                or toxic_status in ["HIGH", "CRITICAL"]
            )

            # ==========================
            # FIREBASE UPDATE
            # ==========================
            prediction_ref.child(sensor_id).set({

                "location": location,

                "latitude": lat,

                "longitude": lng,

                "fire_status": fire_status,

                "probability": probability,

                "toxic_level": toxic_status,

                "gas_average": round(gas_avg, 2),

                "temperature": temp,

                "humidity": hum,

                "time": datetime.now().strftime("%H:%M:%S")
            })

            print(" Firebase Updated!")

            # ==========================
            # SAVE DATABASE
            # ==========================
            save_db(
                sensor_id,
                mq2,
                mq135,
                mq7,
                temp,
                hum,
                fire_status,
                probability,
                toxic_status,
                gas_avg,
                lat,
                lng
            )

            # ==========================
            # SEND EMAIL ALERT
            # ==========================
            if is_danger:

                body = f"""
TUNNEL ALERT

Sensor ID : {sensor_id}

Location : {location}

GPS : ({lat}, {lng})

Fire Status : {fire_status}

Probability : {probability}

Toxic Level : {toxic_status}

Gas Average : {round(gas_avg, 2)}

Temperature : {temp} °C

Humidity : {hum} %

Time : {datetime.now().strftime('%H:%M:%S')}
"""

                send_alert(
                    "Tunnel Emergency Alert",
                    body,
                    ADMIN_EMAILS
                )

        print("====================================")

        time.sleep(3)

    except Exception as e:

        print("Error:", e)

        time.sleep(3)