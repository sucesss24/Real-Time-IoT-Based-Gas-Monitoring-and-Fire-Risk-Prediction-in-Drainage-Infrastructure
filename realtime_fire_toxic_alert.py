# -------------------------------------------------
# Drainage Tunnel Fire Prediction - Train & Evaluate
# -------------------------------------------------

import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ---------------- Step 1: Load preprocessed dataset ----------------
DATA_FILE = "preprocessed_drainage_data.csv"
df = pd.read_csv(DATA_FILE)

print("🚀 Dataset loaded")
print("Shape:", df.shape)
print("\nSafety_Status distribution (%):")
print(df['Safety_Status'].value_counts(normalize=True) * 100)

# ---------------- Step 2: Features and target ----------------
X = df.drop("Safety_Status", axis=1)
y = df["Safety_Status"]

# ---------------- Step 3: Train-test split ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ---------------- Step 4: Feature scaling ----------------
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ---------------- Step 5: Handle class imbalance ----------------
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train),
    y=y_train
)
weights = dict(zip(np.unique(y_train), class_weights))
print("\nClass weights:", weights)

# ---------------- Step 6: Train Random Forest model ----------------
model = RandomForestClassifier(
    n_estimators=200,
    class_weight=weights,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)
print("\n✅ Model trained successfully")

# ---------------- Step 7: Evaluate model ----------------
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# ---------------- Step 8: Save model and scaler ----------------
joblib.dump(model, "fire_prediction_model.pkl")
joblib.dump(scaler, "scaler.pkl")
print("\n💾 Model and scaler saved!")
