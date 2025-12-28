# PostgreSQL Setup Guide for Windows

## Quick Start (5 minutes)

### Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15 or 16 (recommended)
3. Run installer

### Step 2: Install PostgreSQL

1. Accept license agreement
2. Choose installation directory (default is fine)
3. Set superuser password: `postgres_admin` (or any password you prefer)
4. Keep port as 5432
5. Keep locale as default
6. Complete installation
7. Uncheck "Stack Builder" at the end

### Step 3: Create Database and User

#### Option A: Using pgAdmin (GUI)

1. Start pgAdmin (installed with PostgreSQL)
2. Login with superuser password
3. Right-click "Databases" → Create → Database
   - Database name: `financial_ai`
   - Click Save
4. Right-click "Login/Group Roles" → Create
   - Name: `financial_admin`
   - Password: `secure_password_change_me`
   - Confirm password
   - Click Save
5. Select `financial_admin` user, go to "Privileges"
   - Check "Superuser" (for easier setup)
   - Click Save

#### Option B: Using Command Line (psql)

1. Open Command Prompt or PowerShell
2. Run: `psql -U postgres`
3. Enter the superuser password you set
4. Run these commands:

```sql
CREATE DATABASE financial_ai;
CREATE USER financial_admin WITH PASSWORD 'secure_password_change_me';
ALTER ROLE financial_admin SET client_encoding TO 'utf8';
ALTER ROLE financial_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE financial_admin SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE financial_ai TO financial_admin;
```

5. Verify: `\du` (shows users) and `\l` (shows databases)
6. Exit: `\q`

### Step 4: Update Backend Configuration

1. Edit: `backend/.env`
2. Update these lines:

```
DATABASE_USER=financial_admin
DATABASE_PASSWORD=secure_password_change_me
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=financial_ai
```

### Step 5: Restart Backend

1. Stop backend server (Ctrl+C in terminal)
2. Start backend again: `python -m uvicorn main:app --reload`
3. Should see: `✓ Database tables created successfully`

### Step 6: Test Connection

1. Go to: http://localhost:3000/login
2. Click "Sign Up"
3. Fill form and click "Sign Up"
4. Should show success message (no more database errors)

## Verify Setup

### Check PostgreSQL is Running

```powershell
# Windows
psql -U financial_admin -d financial_ai -h localhost

# If connected, you see:
# financial_ai=>
# Type \q to exit
```

### Check Backend Connection

```
http://localhost:8000/docs
# Should show all endpoints without errors
```

### Check Tables Created

```powershell
psql -U financial_admin -d financial_ai -h localhost

# List tables:
\dt

# Should show:
# - public.users
# - public.market_data
```

## Troubleshooting

### "could not connect to server"

- Check if PostgreSQL service is running
- Windows Services: Search "Services" → PostgreSQL
- Should be "Running"

### "FATAL: password authentication failed"

- Check username and password in `.env`
- Try psql directly: `psql -U financial_admin -h localhost`
- Make sure no typos in password

### "database financial_ai does not exist"

- Database wasn't created
- Create it using pgAdmin or psql (steps above)

### "permission denied" on login

- User doesn't have enough privileges
- In pgAdmin: Select user → Properties → Privileges
- Give SUPERUSER or LOGIN privilege

## Using pgAdmin to Verify

1. Open pgAdmin (search pgAdmin in Start menu)
2. Login with superuser password
3. Expand "Servers" → PostgreSQL
4. Expand "Databases"
5. Should see "financial_ai"
6. Expand it, then Tables
7. Should see "users" and "market_data" tables

## Running Backend with Database

```powershell
cd C:\Users\sh.khosrowabadi\Desktop\financial-ai-platform\backend
python -m uvicorn main:app --reload
```

Expected output:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Database tables created successfully
```

## Running Frontend with Backend + Database

```powershell
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Then visit: http://localhost:3000/login

You can now:

- ✅ Sign up with new account
- ✅ Login with created account
- ✅ See user in database
- ✅ Full authentication flow working!

## Next Steps

1. Create dashboard page for logged-in users
2. Add email verification
3. Add password reset functionality
4. Connect AI service endpoints
5. Deploy to production

## Common PostgreSQL Ports

- Default: 5432
- If port already in use during setup, change to 5433 or higher
- Update `.env` DATABASE_PORT accordingly

---

**Your database setup should take ~10 minutes!**
