import pandas as pd

# Load raw loan data (go one folder up, then data/)
df = pd.read_csv("../data/loan_data.csv")

# Group all months by borrower
grouped = df.groupby("borrower_id")

# Feature 1: total missed EMIs
missed_emi_count = grouped.apply(
    lambda x: (x["paid"] == 0).sum()
)

# Feature 2: average delay days
avg_delay_days = grouped["delay_days"].mean()

# Feature 3: maximum delay days
max_delay_days = grouped["delay_days"].max()

# Feature 4: EMI to income pressure
emi_income_ratio = grouped.apply(
    lambda x: (x["emi"] / x["income"]).mean()
)

# Combine all features
features_df = pd.DataFrame({
    "missed_emi_count": missed_emi_count,
    "avg_delay_days": avg_delay_days,
    "max_delay_days": max_delay_days,
    "emi_income_ratio": emi_income_ratio
})

# Save final feature file in project root
features_df.to_csv("../borrower_features.csv", index=True)

print("borrower_features.csv created successfully")
