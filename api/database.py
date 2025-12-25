from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# SQLite Database Location
DATABASE_URL = "sqlite:///./loan_risk.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

Base = declarative_base()

# ---------- TABLE ----------
class RiskRecord(Base):
    __tablename__ = "risk_records"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer)
    risk_level = Column(String)
    risk_score = Column(Float)
    recommended_action = Column(String)   # <-- ADD THIS
    timestamp = Column(DateTime)

# ---------- CREATE TABLE ----------
Base.metadata.create_all(bind=engine)

# ---------- DB SESSION ----------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
