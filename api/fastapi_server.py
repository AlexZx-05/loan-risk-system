from datetime import datetime
import os
import pickle

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field

from .auth import authenticate_user, create_access_token, require_role
from .database import RiskRecord, SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://loan-risk-system.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "risk_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "..", "borrower_features_with_risk.csv")
FEATURE_COLUMNS = [
    "missed_emi_count",
    "avg_delay_days",
    "max_delay_days",
    "emi_income_ratio",
]
RISK_MAPPING = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file not found at: {MODEL_PATH}")

with open(MODEL_PATH, "rb") as model_file:
    model = pickle.load(model_file)


class Borrower(BaseModel):
    missed_emi_count: int = Field(ge=0, le=60)
    avg_delay_days: float = Field(ge=0, le=365)
    max_delay_days: float = Field(ge=0, le=365)
    emi_income_ratio: float = Field(ge=0, le=2)


def save_prediction(borrower_id: int, risk_level: str, risk_score: float, action: str) -> None:
    db = SessionLocal()
    try:
        record = RiskRecord(
            borrower_id=borrower_id,
            risk_level=risk_level,
            risk_score=risk_score,
            recommended_action=action,
            timestamp=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
    finally:
        db.close()


def load_feature_data() -> pd.DataFrame:
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=500, detail="Feature data file is missing")

    df = pd.read_csv(DATA_PATH)
    missing_columns = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail=f"Feature data missing required columns: {missing_columns}",
        )

    return df


def get_action(risk_label: str) -> str:
    if risk_label == "HIGH":
        return "ESCALATE_TO_OFFICER"
    if risk_label == "MEDIUM":
        return "MONITOR"
    return "CONTINUE_NORMAL"


def predict_from_features(features: np.ndarray):
    risk_class = int(model.predict(features)[0])
    risk_prob = float(model.predict_proba(features).max())
    risk_label = RISK_MAPPING.get(risk_class, "LOW")
    action = get_action(risk_label)
    return risk_label, risk_prob, action


def latest_snapshot_for_borrower(borrower_id: int):
    df = load_feature_data()
    borrower_row = df[df["borrower_id"] == borrower_id]

    if borrower_row.empty:
        return None

    row = borrower_row.iloc[0]
    features = np.array([row[col] for col in FEATURE_COLUMNS]).reshape(1, -1)
    risk_label, risk_prob, action = predict_from_features(features)

    return {
        "risk_level": risk_label,
        "risk_score": risk_prob,
        "action": action,
        "timestamp": datetime.utcnow().isoformat(),
        "source": "MODEL_SNAPSHOT",
    }


@app.get("/")
def home():
    return {"message": "Loan Risk AI Backend Running Successfully"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
    })

    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


@app.post("/predict")
def predict_risk(data: Borrower):
    features = np.array(
        [
            data.missed_emi_count,
            data.avg_delay_days,
            data.max_delay_days,
            data.emi_income_ratio,
        ]
    ).reshape(1, -1)

    risk_label, risk_prob, action = predict_from_features(features)

    save_prediction(
        borrower_id=0,
        risk_level=risk_label,
        risk_score=risk_prob,
        action=action,
    )

    return {
        "risk_level": risk_label,
        "risk_score": risk_prob,
        "recommended_action": action,
        "explanation": f"Predicted {risk_label} risk with confidence {round(risk_prob, 2)}",
    }


@app.get("/predict_all")
def predict_all_borrowers():
    df = load_feature_data()
    results = []

    for _, row in df.iterrows():
        features = np.array([row[col] for col in FEATURE_COLUMNS]).reshape(1, -1)
        risk_label, risk_prob, action = predict_from_features(features)

        save_prediction(
            borrower_id=int(row["borrower_id"]),
            risk_level=risk_label,
            risk_score=risk_prob,
            action=action,
        )

        results.append(
            {
                "borrower_id": int(row["borrower_id"]),
                "risk_level": risk_label,
                "risk_score": risk_prob,
                "recommended_action": action,
            }
        )

    return {"total_borrowers": len(results), "results": results}


@app.get("/analytics")
def analytics(user=Depends(require_role("OFFICER"))):
    df = load_feature_data()

    preds = model.predict(df[FEATURE_COLUMNS])
    probs = model.predict_proba(df[FEATURE_COLUMNS]).max(axis=1)

    df["risk"] = [RISK_MAPPING[p] for p in preds]
    df["prob"] = probs

    summary = df["risk"].value_counts().to_dict()

    return {
        "total_customers": len(df),
        "summary_counts": summary,
        "percentage": {k: round((v / len(df)) * 100, 2) for k, v in summary.items()},
        "average_confidence": round(float(df["prob"].mean()), 3),
    }


@app.get("/top_risky")
def top_risky(user=Depends(require_role("OFFICER"))):
    df = load_feature_data()

    preds = model.predict(df[FEATURE_COLUMNS])
    probs = model.predict_proba(df[FEATURE_COLUMNS]).max(axis=1)

    df["risk"] = [RISK_MAPPING[p] for p in preds]
    df["prob"] = probs

    risky_df = df[df["risk"] == "HIGH"].sort_values("prob", ascending=False).head(10)

    return risky_df[
        [
            "borrower_id",
            "risk",
            "prob",
            "missed_emi_count",
            "max_delay_days",
            "emi_income_ratio",
        ]
    ].to_dict(orient="records")


@app.get("/need_officer")
def need_officer(user=Depends(require_role("OFFICER"))):
    df = load_feature_data()

    preds = model.predict(df[FEATURE_COLUMNS])
    df["risk"] = [RISK_MAPPING[p] for p in preds]

    officer_cases = df[df["risk"] == "HIGH"]

    return {
        "total_cases": len(officer_cases),
        "cases": officer_cases[
            [
                "borrower_id",
                "missed_emi_count",
                "max_delay_days",
                "emi_income_ratio",
            ]
        ].to_dict(orient="records"),
    }


@app.get("/saved_results")
def saved_results():
    db = SessionLocal()
    try:
        records = db.query(RiskRecord).all()
    finally:
        db.close()

    return [
        {
            "borrower_id": r.borrower_id,
            "risk_level": r.risk_level,
            "risk_score": r.risk_score,
            "recommended_action": r.recommended_action,
            "timestamp": r.timestamp,
        }
        for r in records
    ]


@app.get("/risk_history/{borrower_id}")
def risk_history(borrower_id: int, user=Depends(require_role("OFFICER"))):
    db = SessionLocal()
    try:
        records = (
            db.query(RiskRecord)
            .filter(RiskRecord.borrower_id == borrower_id)
            .order_by(RiskRecord.timestamp)
            .all()
        )
    finally:
        db.close()

    if not records:
        snapshot = latest_snapshot_for_borrower(borrower_id)
        if snapshot is None:
            return {"message": "No history found for this borrower"}

        return {
            "borrower_id": borrower_id,
            "history": [snapshot],
        }

    return {
        "borrower_id": borrower_id,
        "history": [
            {
                "risk_level": r.risk_level,
                "risk_score": r.risk_score,
                "action": r.recommended_action,
                "timestamp": r.timestamp,
                "source": "DB_HISTORY",
            }
            for r in records
        ],
    }
