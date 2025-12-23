import pandas as pd

# Load borrower features
df = pd.read_csv("../borrower_features.csv")


def assign_risk(row):
    high_signals = 0

    if row["missed_emi_count"] >= 3:
        high_signals += 1

    if row["max_delay_days"] >= 60:
        high_signals += 1

    if row["emi_income_ratio"] >= 0.9:
        high_signals += 1

    # Decide risk based on number of strong signals
    if high_signals >= 2:
        return "HIGH"
    elif high_signals == 1:
        return "MEDIUM"
    else:
        return "LOW"

# Apply risk labeling
df["risk_level"] = df.apply(assign_risk, axis=1)

print(df[["missed_emi_count", "max_delay_days", "emi_income_ratio", "risk_level"]].head())

df.to_csv("../borrower_features_with_risk.csv", index=False)

print("borrower_features_with_risk.csv created successfully")