
import pandas as pd


DATA_FILE = "final_dataset.csv"
df = pd.read_csv(DATA_FILE)

print("Raw dataset loaded")
print("Shape:", df.shape)
print(df.head())


df.fillna(0, inplace=True)  


def categorize(row):
    
    if row['Methane conc (ppm)'] < 300 and row['Ethylene conc (ppm)'] < 200 and row['CO conc (ppm)'] < 200:
        return 0  # SAFE
    elif row['Methane conc (ppm)'] < 500 or row['Ethylene conc (ppm)'] < 300 or row['CO conc (ppm)'] < 300:
        return 1  # WARNING
    elif row['Methane conc (ppm)'] < 700 or row['Ethylene conc (ppm)'] < 400 or row['CO conc (ppm)'] < 400:
        return 2  # CRITICAL
    else:
        return 3  # EMERGENCY


df['Safety_Status'] = df.apply(categorize, axis=1)


PREPROCESSED_FILE = "preprocessed_drainage_data.csv"
df.to_csv(PREPROCESSED_FILE, index=False)
print(f"\nPreprocessed dataset saved as {PREPROCESSED_FILE}")
