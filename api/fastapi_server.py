from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
from fastapi import UploadFile, File
from .database import SessionLocal, RiskRecord
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from .auth import authenticate_user, create_access_token, get_current_user, require_role
import os

# ---------------- APP ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://loan-risk-system.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- SAFE PATHS (RAILWAY FIX) ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "risk_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "..", "borrower_features_with_risk.csv")

# ---------- LOAD MODEL ----------
model = pickle.load(open(MODEL_PATH, "rb"))

# ---------- INPUT FORMAT ----------
class Borrower(BaseModel):
    missed_emi_count: int
    avg_delay_days: float
    max_delay_days: float
    emi_income_ratio: float


# ---------- SAVE TO DB ----------
def save_prediction(borrower_id, risk_level, risk_score, action):
    db = SessionLocal()
    record = RiskRecord(
        borrower_id=borrower_id,
        risk_level=risk_level,
        risk_score=risk_score,
        recommended_action=action,
        timestamp=datetime.now()
    )
    db.add(record)
    db.commit()
    db.close()


# ---------- HOME ----------
@app.get("/")
def home():
    return {"message": "Loan Risk AI Backend Running Successfully 🚀"}


# ---------- LOGIN ----------
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"]
    })

    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


# ---------- PREDICT ----------
@app.post("/predict")
def predict_risk(data: Borrower):
    features = np.array([
        data.missed_emi_count,
        data.avg_delay_days,
        data.max_delay_days,
        data.emi_income_ratio
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

    save_prediction(
        borrower_id=0,
        risk_level=risk_label,
        risk_score=float(risk_prob),
        action=action
    )

    return {
        "risk_level": risk_label,
        "risk_score": float(risk_prob),
        "recommended_action": action,
        "explanation": f"Predicted {risk_label} risk with confidence {round(risk_prob,2)}"
    }


# ---------- PREDICT ALL ----------
@app.get("/predict_all")
def predict_all_borrowers():
    df = pd.read_csv(DATA_PATH)
    results = []

    for _, row in df.iterrows():
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

        save_prediction(
            borrower_id=int(row["borrower_id"]),
            risk_level=risk_label,
            risk_score=float(risk_prob),
            action=action
        )

        results.append({
            "borrower_id": int(row["borrower_id"]),
            "risk_level": risk_label,
            "risk_score": float(risk_prob),
            "recommended_action": action
        })

    return {"total_borrowers": len(results), "results": results}


# ---------- ANALYTICS ----------
@app.get("/analytics")
def analytics(user=Depends(require_role("OFFICER"))):
    df = pd.read_csv(DATA_PATH)

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


# ---------- TOP RISKY ----------
@app.get("/top_risky")
def top_risky(user=Depends(require_role("OFFICER"))):
    df = pd.read_csv(DATA_PATH)

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


# ---------- NEED OFFICER ----------
@app.get("/need_officer")
def need_officer(user=Depends(require_role("OFFICER"))):
    df = pd.read_csv(DATA_PATH)

    preds = model.predict(df[[
        "missed_emi_count",
        "avg_delay_days",
        "max_delay_days",
        "emi_income_ratio"
    ]])

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


# ---------- SAVED RESULTS ----------
@app.get("/saved_results")
def saved_results():
    db = SessionLocal()
    records = db.query(RiskRecord).all()
    db.close()

    return [
        {
            "borrower_id": r.borrower_id,
            "risk_level": r.risk_level,
            "risk_score": r.risk_score,
            "recommended_action": r.recommended_action,
            "timestamp": r.timestamp
        }
        for r in records
    ]


# ---------- RISK HISTORY ----------
@app.get("/risk_history/{borrower_id}")
def risk_history(borrower_id: int, user=Depends(require_role("OFFICER"))):
    db = SessionLocal()
    records = (
        db.query(RiskRecord)
        .filter(RiskRecord.borrower_id == borrower_id)
        .order_by(RiskRecord.timestamp)
        .all()
    )
    db.close()

    if not records:
        return {"message": "No history found for this borrower"}

    return {
        "borrower_id": borrower_id,
        "history": [
            {
                "risk_level": r.risk_level,
                "risk_score": r.risk_score,
                "action": r.recommended_action,
                "timestamp": r.timestamp
            }
            for r in records
        ]
    }
