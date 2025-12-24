import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# Load labeled data
df = pd.read_csv("../borrower_features_with_risk.csv")

# Features and label
X = df[[
    "missed_emi_count",
    "avg_delay_days",
    "max_delay_days",
    "emi_income_ratio"
]]

y = df["risk_level"]

# Encode labels (LOW/MEDIUM/HIGH → numbers)
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.3, random_state=42
)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
print(classification_report(y_test, y_pred, target_names=encoder.classes_))

import pickle

# Save trained model
with open("risk_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save label encoder also
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(encoder, f)

print("Model saved successfully!")