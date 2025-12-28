from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from database import get_db, init_db, close_db
from security import verify_password, create_access_token, get_password_hash
from models import User
from schemas import UserCreate, UserInDB, Token, UserResponse

app = FastAPI(
    title="Financial AI Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For OAuth2 flow (but we use custom auth with NextAuth later)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Lifespan events
@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    """Close database connections on shutdown"""
    await close_db() 

# Helper to get user by email
async def get_user_by_email(db: AsyncSession, email: str):
    """Get user by email from database"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

# Sign Up endpoint
@app.post("/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new user account
    """
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        country_code=user_data.country_code,
        is_active=True,
        is_admin=False
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user 

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    """
    Standard OAuth2 endpoint to exchange username/password for an access token.
    """
    user = await get_user_by_email(db, form_data.username)  # form_data.username is email
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "sub": user.email}

# Placeholder for the actual AI Analysis endpoint (will call the AI service)
@app.get("/analysis/recommendations")
async def get_recommendations(current_user: User = Depends(None)): # Depends(get_current_active_user)
    # 1. Fetch user's country_code from DB (using current_user)
    # 2. Call the AI/ML service endpoint asynchronously
    # 3. Return the result
    return {"message": "Endpoint to be connected to the AI service."}