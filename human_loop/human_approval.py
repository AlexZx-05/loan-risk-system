import pandas as pd
import random

# Load AI decisions
df = pd.read_csv("../borrower_decisions_with_explanations.csv")

def human_approval(row):
    """
    Simulate human approval or override.
    """
    if row["recommended_action"] == "ESCALATE_TO_OFFICER":
        # Human may override escalation in some cases
        if row["risk_score"] < 0.9:
            return "APPROVED_WITH_MONITORING"
        else:
            return "APPROVED_ESCALATION"
    else:
        return "AUTO_APPROVED"

# Apply human approval
df["human_decision"] = df.apply(human_approval, axis=1)

# Save final output
df.to_csv("../final_loan_decisions.csv", index=False)

print("final_loan_decisions.csv created successfully")
