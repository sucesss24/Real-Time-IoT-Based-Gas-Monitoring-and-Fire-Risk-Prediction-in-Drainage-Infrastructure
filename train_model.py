# Drainage Tunnel Fire Prediction - Random Forest ML
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib

# Step 1: Load dataset
data = pd.read_csv("smoke_detection_iot.csv")
print("Dataset Loaded Successfully!")
print(data.head()) 

# Step 2: Select relevant features and target
X = data[['Temperature[C]', 'Humidity[%]', 'CNT']]  # updated to match your dataset
y = data['Fire Alarm']

# Step 3: Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 4: Create and train Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 5: Predict and evaluate
y_pred = model.predict(X_test)
print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Step 6: Save the trained model
joblib.dump(model, "fire_prediction_model.pkl")
print("\nModel saved as fire_prediction_model.pkl")
