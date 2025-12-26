from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ---------------- CONFIG ----------------
SECRET_KEY = "loan-risk-secret-key-123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# ---------------- FAKE USERS ----------------
# You can later move to DB users if needed
users_db = {
    "admin": {
        "username": "admin",
        "password": pwd_context.hash("admin123"),
        "role": "ADMIN"
    },
    "officer": {
        "username": "officer",
        "password": pwd_context.hash("officer123"),
        "role": "OFFICER"
    }
}
# ---------------- HELPERS ----------------
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def authenticate_user(username, password):
    user = users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ------------- VERIFY TOKEN --------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"username": username, "role": role}

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token / expired token",
        )

# ------------- ROLE GUARD ----------------
def require_role(required_role: str):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] != required_role and user["role"] != "ADMIN":
            raise HTTPException(
                status_code=403,
                detail="Access Denied"
            )
        return user
    return role_checker
