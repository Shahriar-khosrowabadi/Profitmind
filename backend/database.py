import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import AsyncGenerator

load_dotenv()

# Configuration from environment variables
user = os.getenv("DATABASE_USER")
password = os.getenv("DATABASE_PASSWORD")
host = os.getenv("DATABASE_HOST", "127.0.0.1")
port = os.getenv("DATABASE_PORT", "5432")
name = os.getenv("DATABASE_NAME")

# URL-encode credentials to avoid breaking the DSN when they contain special characters (e.g., @, :)
user_quoted = quote_plus(user) if user else ""
password_quoted = quote_plus(password) if password else ""

SQLALCHEMY_DATABASE_URL = f"postgresql+asyncpg://{user_quoted}:{password_quoted}@{host}:{port}/{name}"
# Async Engine Setup
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=os.getenv("SQL_ECHO", "False") == "True",  # Set to False in production
    pool_size=20,  # Connection pooling
    max_overflow=0,
    future=True  # Enable future mode for SQLAlchemy 2.0
)

# Base class for declarative models
class Base(DeclarativeBase):
    pass

# Async Session Maker
AsyncSessionLocal = sessionmaker(
    bind=engine, 
    class_=AsyncSession,
    expire_on_commit=False,  # Prevent detached instance errors
    autoflush=False
)

# Dependency to get the database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Create tables on startup
async def init_db():
    """Create all database tables"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[init_db] Database tables created successfully")
    except Exception as e:
        print(f"[init_db] Warning: Could not create database tables: {e}")
        print("[init_db] Make sure PostgreSQL is running and .env credentials are correct")

# Dispose engine on shutdown
async def close_db():
    """Close database connection pool"""
    await engine.dispose()
