import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression

# 1. Load borrower features with risk labels
df = pd.read_csv("../borrower_features_with_risk.csv")

# 2. Select features
X = df[
    ["missed_emi_count", "avg_delay_days", "max_delay_days", "emi_income_ratio"]
]

y = df["risk_level"]

# 3. Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# 4. Train model on full data (for scoring purpose)
model = LogisticRegression(max_iter=1000)
model.fit(X, y_encoded)

# 5. Get probability scores
# predict_proba gives probability for each class
proba = model.predict_proba(X)

# 6. Find index of HIGH risk class
high_risk_index = list(encoder.classes_).index("HIGH")

# 7. Use HIGH class probability as risk_score
df["risk_score"] = proba[:, high_risk_index]

# 8. Save scored borrowers
df.to_csv("../borrower_features_with_risk_score.csv", index=False)

print("borrower_features_with_risk_score.csv created successfully")