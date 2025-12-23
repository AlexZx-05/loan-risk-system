import pandas as pd

# Load risk scored borrowers
df = pd.read_csv("../borrower_features_with_risk_score.csv")

def decide_action(risk_score):
    if risk_score < 0.30:
        return "MONITOR"
    elif risk_score < 0.70:
        return "SEND_REMINDER"
    elif risk_score < 0.85:
        return "RECOMMEND_RESTRUCTURE"
    else:
        return "ESCALATE_TO_OFFICER"

def generate_explanation(row):
    reasons = []

    action = row["recommended_action"]

    if action == "ESCALATE_TO_OFFICER":
        reasons.append(f"high risk score ({row['risk_score']:.2f})")

        if row["missed_emi_count"] > 0:
            reasons.append(f"{int(row['missed_emi_count'])} missed EMIs")

        if row["emi_income_ratio"] > 1:
            reasons.append("EMI exceeds income")
        elif row["emi_income_ratio"] > 0.6:
            reasons.append("high EMI burden")

        if row["max_delay_days"] >= 60:
            reasons.append(f"severe payment delay ({int(row['max_delay_days'])} days)")

    else:  # MONITOR or SEND_REMINDER
        if row["missed_emi_count"] > 0:
            reasons.append(f"{int(row['missed_emi_count'])} missed EMIs")

        if row["max_delay_days"] >= 30:
            reasons.append("occasional payment delays")

    return "Decision made because " + ", ".join(reasons)

# Apply decision logic
df["recommended_action"] = df["risk_score"].apply(decide_action)

# Apply explanation logic
df["explanation"] = df.apply(generate_explanation, axis=1)

# Save final decision file
df.to_csv("../borrower_decisions_with_explanations.csv", index=False)

print("borrower_decisions_with_explanations.csv created successfully")
