# PostgreSQL & pgAdmin Setup Required

## Current Status

❌ PostgreSQL is NOT installed on your system
❌ pgAdmin is NOT installed on your system

That's why http://localhost:5050 shows nothing.

---

## Solution: Choose One Option

### Option 1: Install PostgreSQL (Recommended - 5 minutes)

#### Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click: **Download the installer**
3. Choose: **PostgreSQL 15 or 16** (latest version)
4. Download the `.exe` file

#### Step 2: Install PostgreSQL

1. Run the downloaded `.exe` file
2. Accept the license agreement
3. Choose installation path (default is fine): `C:\Program Files\PostgreSQL\16\`
4. Set superuser password: `postgres_admin` (remember this!)
5. Keep port as: `5432`
6. Keep locale as: **Default**
7. Click **Next** through the rest
8. **Important**: When asked about Stack Builder at the end, **UNCHECK IT** and click Finish

#### Step 3: Verify Installation

```powershell
# Open Command Prompt and run:
psql --version

# Should show: psql (PostgreSQL) 16.x
```

#### Step 4: pgAdmin Comes Automatically

After PostgreSQL install, pgAdmin is included! Access at:

```
http://localhost:5050
```

Default credentials:

```
Email: postgres@pgadmin.org
Password: admin
```

---

### Option 2: Use Command Line Only (No GUI - Faster)

If you don't want to install anything, use PostgreSQL via command line:

#### Step 1: Install PostgreSQL

Same as Option 1 above

#### Step 2: Access via Command Line

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# Password: postgres_admin (what you set during install)

# Create database
CREATE DATABASE financial_ai;

# Create user
CREATE USER financial_admin WITH PASSWORD 'aA@12345678';

# Grant permissions
ALTER ROLE financial_admin SET client_encoding TO 'utf8';
ALTER ROLE financial_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE financial_admin SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE financial_ai TO financial_admin;

# Exit
\q

# Verify - connect as financial_admin
psql -U financial_admin -d financial_ai -h localhost
```

#### Step 3: View Users from Command Line

```powershell
# Connect to your database
psql -U financial_admin -d financial_ai -h localhost

# View all users in database
SELECT email, is_active, is_admin FROM users;

# Exit
\q
```

---

### Option 3: Use Docker (Advanced)

If you have Docker installed:

```powershell
# Start PostgreSQL in Docker
docker run --name postgres_financial -e POSTGRES_PASSWORD=postgres_admin -e POSTGRES_DB=financial_ai -p 5432:5432 -d postgres:16

# Then run backend to create tables
cd backend
python -m uvicorn main:app --reload
```

---

## Quick Comparison

| Method                              | Install Time | Difficulty | GUI    | Native |
| ----------------------------------- | ------------ | ---------- | ------ | ------ |
| Option 1: Full PostgreSQL + pgAdmin | 5 min        | Easy       | ✅ Yes | ✅ Yes |
| Option 2: PostgreSQL + Command Line | 5 min        | Medium     | ❌ No  | ✅ Yes |
| Option 3: Docker                    | 10 min       | Hard       | ❌ No  | ❌ No  |

**I recommend Option 1** - easiest and you get pgAdmin GUI!

---

## After Installation

### Step 1: Update Backend Config

Edit `backend/.env` and ensure it has:

```
DATABASE_USER=financial_admin
DATABASE_PASSWORD=aA@12345678
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=financial_ai
```

### Step 2: Restart Backend

```powershell
cd backend
python -m uvicorn main:app --reload
```

Backend will show: `✓ Database tables created successfully`

### Step 3: Access pgAdmin

Open browser: http://localhost:5050

Login:

```
Email: postgres@pgadmin.org
Password: admin
```

### Step 4: Test Login

1. Go to: http://localhost:3000/login
2. Click Sign Up
3. Create test account
4. Login with that account

---

## Troubleshooting Installation

### "Port 5432 already in use"

- Something else is using port 5432
- Choose a different port during install (e.g., 5433)
- Update `.env`: `DATABASE_PORT=5433`

### "psql command not found"

- PostgreSQL path not in system PATH
- Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
- Restart PowerShell

### "Cannot connect to server"

- PostgreSQL service not running
- Check: Windows Services → PostgreSQL → Status
- Start it if stopped

### "pgAdmin shows nothing"

- pgAdmin service not running (starts automatically usually)
- Restart computer
- Or run pgAdmin manually from Start Menu

---

## Next Steps

1. **Download PostgreSQL** from https://www.postgresql.org/download/windows/
2. **Install it** (follow the installer steps)
3. **Create database** (via pgAdmin or command line)
4. **Restart backend**
5. **Test login** at http://localhost:3000/login

**Then you can use pgAdmin at http://localhost:5050!** 🚀
