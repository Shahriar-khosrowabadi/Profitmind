"""
Script to seed test users into the database
Run this once to create test accounts for development
"""
import asyncio
import os
from dotenv import load_dotenv
from database import AsyncSessionLocal, init_db
from models import User
from security import get_password_hash

load_dotenv()

async def seed_test_users():
    """Create test users for development"""
    
    # Initialize database tables
    await init_db()
    
    # Create async session
    async with AsyncSessionLocal() as session:
        # Test users data
        test_users = [
            {
                "email": "test@example.com",
                "password": "TestPassword123",
                "country_code": "US",
                "is_admin": False
            },
            {
                "email": "admin@example.com",
                "password": "AdminPassword123",
                "country_code": "US",
                "is_admin": True
            },
            {
                "email": "demo@example.com",
                "password": "DemoPassword123",
                "country_code": "UK",
                "is_admin": False
            }
        ]
        
        for user_data in test_users:
            # Check if user already exists
            from sqlalchemy import select
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalars().first()
            
            if not existing_user:
                # Create new user
                new_user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    country_code=user_data["country_code"],
                    is_active=True,
                    is_admin=user_data["is_admin"]
                )
                session.add(new_user)
                print(f"[seed] Created user: {user_data['email']}")
            else:
                print(f"[seed] User already exists: {user_data['email']}")
        
        await session.commit()
        print("\n[seed] Seeding complete!")
        print("\nTest Credentials:")
        print("=" * 50)
        for user_data in test_users:
            print(f"Email: {user_data['email']}")
            print(f"Password: {user_data['password']}")
            print(f"Role: {'Admin' if user_data['is_admin'] else 'User'}")
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(seed_test_users())
