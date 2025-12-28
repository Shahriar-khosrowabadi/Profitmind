# Files Reference - Where Everything Is

## User Credentials Location

### 📁 Backend Files

**1. Database Connection Credentials**

- 📄 `backend/.env` (LINE 1-6)
  ```
  DATABASE_USER=financial_admin
  DATABASE_PASSWORD=secure_password_change_me
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_NAME=financial_ai
  ```
  **Purpose:** Connect to PostgreSQL (NOT app login)

**2. User Model Definition**

- 📄 `backend/models.py` (Entire file)
  ```python
  class User(Base):
      __tablename__ = "users"
      id = Column(Integer, primary_key=True)
      email = Column(String, unique=True, index=True, nullable=False)
      hashed_password = Column(String, nullable=False)
      is_active = Column(Boolean, default=True)
      is_admin = Column(Boolean, default=False)
      country_code = Column(String(5), nullable=True)
  ```
  **Purpose:** Defines what user data looks like in database

**3. Authentication Logic**

- 📄 `backend/main.py` (LINE 75-108)
  - `login_for_access_token()` function
  - Checks email and password against database
  - Returns JWT token if valid

**4. Password Hashing**

- 📄 `backend/security.py` (Entire file)
  - `get_password_hash()` - Hashes password for storage
  - `verify_password()` - Checks if login password matches stored hash

**5. Seed Users Script** (NEW)

- 📄 `backend/seed_users.py` (Entire file)
  - Auto-creates 3 test users
  - Run: `python seed_users.py`
  - Creates:
    - test@example.com / TestPassword123
    - admin@example.com / AdminPassword123
    - demo@example.com / DemoPassword123

---

### 💾 Where User Data is Stored

**PostgreSQL Database**

- Server: localhost:5432
- Database: `financial_ai`
- User: `financial_admin`
- Table: `users`
- Columns: id, email, hashed_password, is_active, is_admin, country_code, created_at, updated_at

**How to Access:**

```powershell
# Connect to database
psql -U financial_admin -d financial_ai -h localhost

# View all users
SELECT email, is_active, is_admin FROM users;
```

---

### 🔐 How Login Works

```
USER ENTERS CREDENTIALS
        ↓
FRONTEND (frontend/app/login/page.tsx)
  - Validates email format
  - Validates password length
        ↓
BACKEND API (backend/main.py)
  - Receives /token request
  - Queries database for user by email
  - Verifies password hash (security.py)
        ↓
DATABASE (PostgreSQL users table)
  - Retrieves user record
  - Checks hashed_password field
        ↓
BACKEND RESPONSE
  - If valid: Returns JWT token
  - If invalid: Returns 401 error
        ↓
FRONTEND
  - Stores token in session (NextAuth)
  - Redirects to dashboard
```

---

## Quick File Lookup

**Need to change login logic?**
→ Edit: `backend/main.py` (line 75-108, `login_for_access_token` function)

**Need to change password hashing?**
→ Edit: `backend/security.py`

**Need to see user table structure?**
→ Edit: `backend/models.py` (User class)

**Need to change database credentials?**
→ Edit: `backend/.env` (lines 1-6)

**Need to create test users?**
→ Run: `python backend/seed_users.py`

**Need to check stored users?**
→ Use: pgAdmin or `psql` command

**Need to change frontend login page?**
→ Edit: `frontend/app/login/page.tsx`

**Need to change login form validation?**
→ Edit: `frontend/components/auth/LoginForm.tsx`

---

## Complete File Structure

```
backend/
├── main.py              ← Login endpoint
├── models.py            ← User table schema
├── security.py          ← Password hashing
├── database.py          ← Database connection
├── schemas.py           ← Request/response models
├── seed_users.py        ← Create test users (NEW)
└── .env                 ← Database credentials

frontend/
├── app/
│   ├── login/
│   │   └── page.tsx     ← Login page UI
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.tsx ← NextAuth config
└── components/auth/
    └── LoginForm.tsx    ← Login form component
```

---

## Default Credentials After Seed

After running `python seed_users.py`:

```
Account 1 (Regular User):
  File: PostgreSQL users table
  Email: test@example.com
  Password: TestPassword123
  Role: User
  Active: Yes

Account 2 (Admin):
  File: PostgreSQL users table
  Email: admin@example.com
  Password: AdminPassword123
  Role: Admin
  Active: Yes

Account 3 (Demo):
  File: PostgreSQL users table
  Email: demo@example.com
  Password: DemoPassword123
  Role: User
  Active: Yes
```

---

## Commands Reference

```powershell
# Create test users
cd backend
python seed_users.py

# Check users in database
psql -U financial_admin -d financial_ai -h localhost
SELECT email, is_active, is_admin FROM users;
\q

# Start backend
cd backend
python -m uvicorn main:app --reload

# Start frontend
cd frontend
npm run dev

# Test login via API
# Visit: http://localhost:8000/docs
# Try: POST /token with email and password
```

---

**Everything is organized and documented!** 🎯
