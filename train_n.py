
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import matplotlib.pyplot as plt


df = pd.read_csv("noisy_drainage_data.csv")

print("Columns in dataset:")
print(df.columns)


FEATURES_RAW = [
    "Methane conc (ppm)",
    "Ethylene conc (ppm)",
    "CO conc (ppm)",
    "Temperature[C]",
    "Humidity[%]"
]
TARGET = "Safety_Status"

df = df[FEATURES_RAW + [TARGET]]


df.rename(columns={
    "Methane conc (ppm)": "mq2",
    "Ethylene conc (ppm)": "mq135",
    "CO conc (ppm)": "mq7",
    "Temperature[C]": "temp",
    "Humidity[%]": "hum",
    "Safety_Status": "label"
}, inplace=True)


df.drop_duplicates(inplace=True)

df["temp"] = df["temp"].replace(0, df["temp"].mean()).clip(0, 80)
df["hum"] = df["hum"].replace(0, df["hum"].mean()).clip(0, 100)

for gas in ["mq2", "mq135", "mq7"]:
    df[gas] = df[gas].clip(0, 1000)


X = df[["mq2", "mq135", "mq7", "temp", "hum"]]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)


pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_split=20,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    ))
])


pipeline.fit(X_train, y_train)


print("\nModel Evaluation")
print("Training Accuracy:", accuracy_score(y_train, pipeline.predict(X_train)))
print("Test Accuracy:", accuracy_score(y_test, pipeline.predict(X_test)))

print("\nClassification Report:")
print(classification_report(y_test, pipeline.predict(X_test)))


cv_scores = cross_val_score(pipeline, X, y, cv=5)
print("Mean CV Accuracy:", cv_scores.mean())


rf = pipeline.named_steps["model"]
plt.bar(X.columns, rf.feature_importances_)
plt.title("Feature Importance")
plt.show()


joblib.dump(pipeline, "fire_prediction_pipeline.pkl")
print("\nModel saved as fire_prediction_pipeline.pkl")