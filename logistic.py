
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib


df = pd.read_csv("noisy_drainage_data.csv")

print(" Dataset Loaded Successfully!\n")


df = df.rename(columns={
    "Temperature[C]": "temp",
    "Humidity[%]": "hum",
    "Methane conc (ppm)": "mq2",
    "CO conc (ppm)": "mq7",
    "Ethylene conc (ppm)": "mq135",
    "H2S conc (ppm)": "h2s",
    "NH3 conc (ppm)": "nh3",
    "Oxygen level (%)": "oxygen",
    "Safety_Status": "label"
})

print("Columns:\n", df.columns)


X = df[["mq2", "mq135", "mq7", "h2s", "nh3", "oxygen", "temp", "hum"]]
y = df["label"]


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# STEP 5: Feature Scaling (IMPORTANT)

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


# STEP 6: Train Model 

model = LogisticRegression(
    solver='saga',            # better for large dataset
    max_iter=2000,            # avoid convergence issue
    class_weight='balanced'   # handle FIRE imbalance
)

model.fit(X_train, y_train)

print("\n Model Training Completed!")


# STEP 7: Evaluation

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))


# STEP 8: Save Model + Scaler

joblib.dump(model, "logistic_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\n Model saved as logistic_model.pkl")
print(" Scaler saved as scaler.pkl")


# STEP 9: Test Sample (Correct Way)

print("\n Testing with sample input...")

sample = pd.DataFrame([[
    300, 200, 50, 10, 20, 20.5, 35, 60
]], columns=["mq2","mq135","mq7","h2s","nh3","oxygen","temp","hum"])

sample_scaled = scaler.transform(sample)

prediction = model.predict(sample_scaled)[0]
probability = max(model.predict_proba(sample_scaled)[0])

# Label mapping
label_map = {
    0: "SAFE",
    1: "WARNING",
    2: "FIRE ALERT"
}

print(f"\nPrediction: {label_map[prediction]}")
print(f"Confidence: {round(probability, 2)}")