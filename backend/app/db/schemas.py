from pydantic import BaseModel, EmailStr
from typing import Optional

# -----------------------------
# Schema for User Creation Input
# -----------------------------
class UserCreate(BaseModel):
    username: str
    email: EmailStr  # Validates email format
    password: str    # Plain password (to be hashed later)

# -----------------------------
# Schema for User Output (Response)
# -----------------------------
class UserOut(BaseModel):
    id: int
    username: str
    email: str

    # Enables compatibility with ORM objects (e.g., SQLAlchemy)
    model_config = {
        "from_attributes": True
    }

# -----------------------------
# Schema for Token Response
# -----------------------------
class Token(BaseModel):
    access_token: str  # JWT token string
    token_type: str    # Typically "bearer"

# -----------------------------
# Schema to Extract Data from Token
# -----------------------------
class TokenData(BaseModel):
    username: Optional[str] = None  # Optional, in case token lacks it
