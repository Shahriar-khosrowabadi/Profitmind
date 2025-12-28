# Financial AI Platform - Login Page Setup Guide

## Overview

A complete, production-ready authentication system with a beautiful split-screen login page featuring:

- Left side: Login and Sign Up forms with validation
- Right side: Animated gradient background
- Full backend integration with FastAPI
- Database support with PostgreSQL
- JWT token-based authentication

## What Has Been Created

### Frontend (`/frontend`)

#### 1. **Login Page** (`app/login/page.tsx`)

- Split-screen layout (50/50 on large screens)
- Animated gradient background with blob animations
- Toggle between Login and Sign Up forms
- Responsive design (mobile-friendly)

#### 2. **Login Form** (`components/auth/LoginForm.tsx`)

- Email and password inputs
- Password visibility toggle
- Form validation with Zod
- Error handling and display
- Loading states
- "Remember me" checkbox
- "Forgot password" link

#### 3. **Sign Up Form** (`components/auth/SignUpForm.tsx`)

- Email, password, confirm password, and country selector
- Real-time form validation
- Password match validation
- Country dropdown with 10+ countries
- Terms of Service acceptance notice
- Error handling

#### 4. **API Routes**

- `app/api/auth/[...nextauth]/route.tsx` - NextAuth configuration
- `app/api/auth/signup/route.ts` - Sign up endpoint that proxies to backend

#### 5. **Environment Configuration** (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

#### 6. **Styling** (`app/globals.css`)

- Added blob animation for gradient effects
- Animation delays for staggered effects
- Responsive utilities

### Backend (`/backend`)

#### 1. **Authentication Endpoints**

- `POST /token` - Login endpoint (OAuth2 compatible)
- `POST /auth/signup` - User registration endpoint

#### 2. **Core Files Updated**

**`database.py`**

- Environment-based configuration
- Async PostgreSQL connection pooling
- Database initialization and cleanup
- Proper session management

**`security.py`**

- Password hashing with bcrypt
- JWT token creation and validation
- Environment variable configuration

**`main.py`**

- CORS middleware configuration
- Startup/shutdown events for DB initialization
- Signup and login endpoints implemented

**`schemas.py`** (New)

- Pydantic models for request/response validation
- UserCreate, UserResponse, Token schemas

**`.env`** (New)

```
DATABASE_USER=financial_admin
DATABASE_PASSWORD=secure_password_change_me
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=financial_ai

SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Setup Instructions

### 1. Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Update .env file with your actual database credentials
# Update SECRET_KEY with a secure value:
# On PowerShell: $([Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))) | ForEach-Object {$_.Replace('+', '-').Replace('/', '_').TrimEnd('=')}

# Run backend (requires PostgreSQL running)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Update .env.local if needed
# Generate NEXTAUTH_SECRET:
# openssl rand -hex 32

# Run frontend dev server
npm run dev
```

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE financial_ai;
CREATE USER financial_admin WITH PASSWORD 'your_secure_password';
ALTER ROLE financial_admin SET client_encoding TO 'utf8';
ALTER ROLE financial_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE financial_admin SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE financial_ai TO financial_admin;
```

### 2. Tables Creation

Tables are automatically created on backend startup via the `init_db()` function:

- `users` - Stores user accounts with hashed passwords
- `market_data` - Stores financial market data (for future use)

## User Registration Flow

### Frontend (Sign Up):

1. User fills form: email, password, country
2. Form validates with Zod schema
3. POST to `/api/auth/signup` with data
4. Frontend proxies to backend `/auth/signup`

### Backend (Create User):

1. Validates email doesn't exist
2. Hashes password with bcrypt
3. Creates user record in database
4. Returns 201 with user data

### Frontend (Login):

1. User enters email and password
2. Uses NextAuth `signIn()` with credentials provider
3. NextAuth calls `authorize()` callback
4. Callback calls backend `/token` endpoint
5. Backend validates credentials and returns JWT
6. NextAuth stores token in session
7. Redirects to `/dashboard`

## Security Features Implemented

✅ Password hashing with bcrypt
✅ JWT token-based authentication
✅ CORS middleware configuration
✅ Environment-based configuration (no hardcoded secrets)
✅ SQL injection protection (SQLAlchemy ORM)
✅ Form validation (frontend & backend)
✅ HTTP-only cookies for NextAuth
✅ Inactive user detection

## Next Steps

1. **Connect to Real Database**

   - Ensure PostgreSQL is running
   - Update `.env` file with credentials

2. **Test the Flow**

   - Start backend: `uvicorn main:app --reload`
   - Start frontend: `npm run dev`
   - Visit http://localhost:3000/login

3. **Create Dashboard Page**

   - Add `/app/dashboard/page.tsx`
   - Protected route using `useSession()`

4. **Add More Auth Features**

   - Email verification
   - Password reset flow
   - 2FA support

5. **Production Deployment**
   - Set strong `SECRET_KEY` in production
   - Use environment variables
   - Enable HTTPS
   - Configure CORS properly
   - Database backups

## File Structure

```
backend/
├── main.py          # FastAPI app with endpoints
├── database.py      # Database configuration
├── models.py        # SQLAlchemy models
├── security.py      # JWT and password utilities
├── schemas.py       # Pydantic models
├── requirements.txt # Python dependencies
└── .env             # Configuration file

frontend/
├── app/
│   ├── page.tsx     # Redirects to /login
│   ├── login/
│   │   └── page.tsx # Login page
│   ├── api/auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.tsx # NextAuth config
│   │   └── signup/
│   │       └── route.ts  # Sign up API
│   └── globals.css  # Animations
├── components/auth/
│   ├── LoginForm.tsx
│   └── SignUpForm.tsx
├── package.json
├── .env.local
└── tsconfig.json
```

## Troubleshooting

**"sqlalchemy.orm could not be resolved"**

- Run `pip install -r requirements.txt` again
- Select correct Python interpreter in VS Code

**Frontend can't connect to backend**

- Ensure `NEXT_PUBLIC_API_URL` is correct
- Check backend is running on port 8000
- Verify CORS is configured

**Database connection failed**

- Ensure PostgreSQL is running
- Check `.env` credentials
- Verify database exists

**Password validation errors**

- Password must be 8+ characters for sign up
- Password must be 6+ characters for login

---

The system is now ready for development! 🚀
