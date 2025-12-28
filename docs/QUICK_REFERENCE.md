# Quick Reference Card

## 🚀 Getting Started (60 seconds)

```powershell
# 1. Setup everything
.\setup.ps1

# 2. Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# 3. Terminal 2 - Frontend
cd frontend
npm run dev

# 4. Open browser
# http://localhost:3000/login
```

## 📋 Key Endpoints

### Backend API

```
POST http://localhost:8000/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "country_code": "US"
}

POST http://localhost:8000/token
Form data:
  username: user@example.com
  password: SecurePass123
  grant_type: password
```

### API Docs

```
http://localhost:8000/docs       # Swagger UI
http://localhost:8000/redoc      # ReDoc
```

## 🔧 Configuration Quick Links

| File                          | Purpose               |
| ----------------------------- | --------------------- |
| `backend/.env`                | Database & JWT config |
| `frontend/.env.local`         | API URL & NextAuth    |
| `backend/models.py`           | Database schema       |
| `backend/security.py`         | Auth logic            |
| `frontend/app/login/page.tsx` | UI page               |

## 📝 Test Credentials

After signup:

```
Email: test@example.com
Password: TestPassword123
Country: United States
```

## 🐛 Common Issues

| Issue                        | Solution                                               |
| ---------------------------- | ------------------------------------------------------ |
| Backend won't connect to DB  | Check `backend/.env` credentials                       |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_URL` in `.env.local`            |
| "Module not found" errors    | Run `pip install -r requirements.txt` or `npm install` |
| Port already in use          | Kill process: `lsof -i :8000` or `lsof -i :3000`       |
| Import errors in Python      | Ensure running from project root with correct venv     |

## 📊 Project Structure Shortcuts

```
Backend: backend/
  - main.py (endpoints)
  - models.py (database schema)
  - security.py (auth logic)

Frontend: frontend/
  - app/login/ (auth page)
  - components/auth/ (form components)
  - app/api/auth/ (NextAuth config)
```

## 🔑 Key Commands

```powershell
# Backend
pip install -r requirements.txt      # Install deps
uvicorn main:app --reload           # Run dev server
uvicorn main:app --host 0.0.0.0 --port 8000  # Run production

# Frontend
npm install                          # Install deps
npm run dev                         # Run dev server
npm run build                       # Build for production
npm run lint                        # Run linter
```

## 🌐 URLs

| Service     | URL                         |
| ----------- | --------------------------- |
| Frontend    | http://localhost:3000       |
| Backend API | http://localhost:8000       |
| API Docs    | http://localhost:8000/docs  |
| Login Page  | http://localhost:3000/login |

## 💾 Database

### Connect to DB

```powershell
# Using psql
psql -U financial_admin -d financial_ai -h localhost

# Check tables
\dt

# Query users
SELECT * FROM users;
```

## 📚 Documentation Files

- `README.md` - Full project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `MIGRATIONS.md` - Database migrations
- This file - Quick reference

## 🔐 Security Checklist

Before production:

- [ ] Change `SECRET_KEY` in `.env`
- [ ] Change `NEXTAUTH_SECRET` in `.env.local`
- [ ] Change database password
- [ ] Update CORS origins
- [ ] Enable HTTPS
- [ ] Set `SQL_ECHO=False`
- [ ] Update `.gitignore` and don't commit secrets

## 📞 Support

Check these in order:

1. `SETUP_GUIDE.md` - Detailed troubleshooting
2. `README.md` - General info
3. Backend logs - Run with `--reload` for errors
4. Frontend console - Dev tools (F12)

## 🎯 Next Steps

1. Test signup and login flow
2. Create dashboard page
3. Add email verification
4. Implement password reset
5. Connect AI service
6. Deploy to production

---

**Last Updated**: December 3, 2025
