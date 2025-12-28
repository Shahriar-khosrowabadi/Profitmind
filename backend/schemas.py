from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    country_code: Optional[str] = None

class UserInDB(BaseModel):
    id: int
    email: str
    is_active: bool
    is_admin: bool
    country_code: Optional[str]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    country_code: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    sub: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
