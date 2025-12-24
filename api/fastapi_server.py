from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
from fastapi import UploadFile, File


app = FastAPI()

# Load ML model
model = pickle.load(open("../ml/risk_model.pkl", "rb"))

# ---------- INPUT FORMAT ----------
class Borrower(BaseModel):
    missed_emi_count: int
    avg_delay_days: float
    max_delay_days: float
    emi_income_ratio: float


# ---------- HOME ----------
@app.get("/")
def home():
    return {"message": "Loan Risk AI Backend Running Successfully 🚀"}


@app.get("/predict_all")
def predict_all_borrowers():
    df = pd.read_csv("../borrower_features_with_risk.csv")

    results = []

    for _, row in df.iterrows():

        # Prepare features for ML model
        features = np.array([
            row["missed_emi_count"],
            row["avg_delay_days"],
            row["max_delay_days"],
            row["emi_income_ratio"]
        ]).reshape(1, -1)

        # Predict
        risk_class = model.predict(features)[0]
        risk_prob = model.predict_proba(features).max()

        # SAME MAPPING AS YOUR /predict API
        mapping = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
        risk_label = mapping[risk_class]

        # Decision logic (same style as yours)
        if risk_label == "HIGH":
            action = "ESCALATE_TO_OFFICER"
        elif risk_label == "MEDIUM":
            action = "MONITOR"
        else:
            action = "CONTINUE_NORMAL"

        explanation = (
            f"Predicted {risk_label} risk with confidence "
            f"{round(risk_prob,2)} based on EMI behaviour."
        )

        results.append({
            "borrower_id": int(row["borrower_id"]),
            "risk_level": risk_label,
            "risk_score": float(risk_prob),
            "recommended_action": action,
            "explanation": explanation
        })

    return {
        "total_borrowers": len(results),
        "results": results
    }

@app.post("/upload_predict")
async def upload_predict(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    results = []

    for i, row in df.iterrows():
        features = np.array([
            row["missed_emi_count"],
            row["avg_delay_days"],
            row["max_delay_days"],
            row["emi_income_ratio"]
        ]).reshape(1, -1)

        risk_class = model.predict(features)[0]
        risk_prob = model.predict_proba(features).max()

        mapping = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
        risk_label = mapping[risk_class]

        if risk_label == "HIGH":
            action = "ESCALATE_TO_OFFICER"
        elif risk_label == "MEDIUM":
            action = "MONITOR"
        else:
            action = "CONTINUE_NORMAL"

        results.append({
            "borrower_id": int(row["borrower_id"]),
            "risk_level": risk_label,
            "risk_score": float(risk_prob),
            "recommended_action": action
        })

    return {
        "total_borrowers": len(results),
        "results": results
    }

#-----Analytics api-----
@app.get("/analytics")
def analytics():
    df = pd.read_csv("../borrower_features_with_risk.csv")

    features = df[[
        "missed_emi_count",
        "avg_delay_days",
        "max_delay_days",
        "emi_income_ratio"
    ]]

    preds = model.predict(features)
    probs = model.predict_proba(features).max(axis=1)

    mapping = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
    df["risk"] = [mapping[p] for p in preds]
    df["prob"] = probs

    summary = df["risk"].value_counts().to_dict()

    return {
        "total_customers": len(df),
        "summary_counts": summary,
        "percentage": {
            k: round((v / len(df)) * 100, 2)
            for k, v in summary.items()
        },
        "average_confidence": round(float(df["prob"].mean()), 3)
    }

#-------Top 10 High Risk Borrowers------
@app.get("/top_risky")
def top_risky():
    df = pd.read_csv("../borrower_features_with_risk.csv")

    features = df[[
        "missed_emi_count",
        "avg_delay_days",
        "max_delay_days",
        "emi_income_ratio"
    ]]

    preds = model.predict(features)
    probs = model.predict_proba(features).max(axis=1)

    mapping = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
    df["risk"] = [mapping[p] for p in preds]
    df["prob"] = probs

    risky_df = df[df["risk"] == "HIGH"].sort_values("prob", ascending=False).head(10)

    return risky_df[[
        "borrower_id",
        "risk",
        "prob",
        "missed_emi_count",
        "max_delay_days",
        "emi_income_ratio"
    ]].to_dict(orient="records")

#------/need_officer-----Only borrowers that require escalation ,Used by bank officers directly

@app.get("/need_officer")
def need_officer():
    df = pd.read_csv("../borrower_features_with_risk.csv")

    features = df[[
        "missed_emi_count",
        "avg_delay_days",
        "max_delay_days",
        "emi_income_ratio"
    ]]

    preds = model.predict(features)
    mapping = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
    df["risk"] = [mapping[p] for p in preds]

    officer_cases = df[df["risk"] == "HIGH"]

    return {
        "total_cases": len(officer_cases),
        "cases": officer_cases[[
            "borrower_id",
            "missed_emi_count",
            "max_delay_days",
            "emi_income_ratio"
        ]].to_dict(orient="records")
    }
