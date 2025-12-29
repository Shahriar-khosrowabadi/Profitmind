![ProfitMind](docs/images/ProfitMind%20picture.png)

# Financial AI Platform

A full-stack financial dashboard with a modern Next.js frontend, a FastAPI backend, and an optional AI service scaffold.

## Overview

This repository contains three services:

- Frontend: Next.js 16 app with a dashboard UI, NextAuth-based authentication, Prisma/Postgres persistence, and a live market chart backed by the Twelve Data API.
- Backend: FastAPI service with JWT authentication and async SQLAlchemy models for users and market data.
- AI service: a separate FastAPI app intended for investment recommendation experiments (currently returns mock data when no model is available).

The frontend and backend can point to the same Postgres instance but manage different tables. Keep separate databases if you want full isolation.

## Key Features

- Polished authentication UI and dashboard experience.
- NextAuth credentials flow backed by Prisma and PostgreSQL.
- FastAPI JWT auth endpoints for future API integrations.
- Live XAU/USD chart powered by Twelve Data.
- Optional AI service scaffold for future ML inference.

## Tech Stack

- Frontend: Next.js, React, NextAuth, Prisma, Tailwind CSS, lightweight-charts.
- Backend: FastAPI, SQLAlchemy (async), Pydantic, JWT.
- Data: PostgreSQL.
- AI service: FastAPI, pandas, numpy (mock or model-backed).

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+

## Environment Variables

Frontend (create `frontend/.env.local`):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-strong-secret
TWELVE_DATA_API_KEY=your-twelve-data-key
```

Backend (create or update `backend/.env`):

```
DATABASE_USER=financial_admin
DATABASE_PASSWORD=your_password
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=financial_ai

SECRET_KEY=replace-with-a-strong-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SQL_ECHO=False
```

Optional admin seeding for Prisma (set before running `npm run prisma:seed`):

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassw0rd!
ADMIN_NAME=Admin
```

## Database Setup (PostgreSQL)

Create a database and user:

```
CREATE DATABASE financial_ai;
CREATE USER financial_admin WITH PASSWORD 'your_password';
ALTER ROLE financial_admin SET client_encoding TO 'utf8';
ALTER ROLE financial_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE financial_admin SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE financial_ai TO financial_admin;
```

## Local Development

Backend:

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```
cd frontend
npm install
npx prisma migrate dev
npm run dev
```

Optional AI service:

```
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## Useful URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs
- AI Service (optional): http://localhost:8001

## API Endpoints (Backend)

- POST `/auth/signup` - create a user
- POST `/token` - obtain a JWT
- GET `/analysis/recommendations` - placeholder endpoint

## Notes on Authentication

- The frontend currently authenticates with NextAuth + Prisma.
- The backend exposes JWT-based auth endpoints for future integrations.
- If you want the frontend to use the backend for auth, wire the NextAuth `authorize` callback or API routes to the FastAPI endpoints.

## Project Structure

```
financial-ai-platform/
  backend/        FastAPI service
  frontend/       Next.js app
  ai_service/     Optional ML service
  docs/           Additional setup notes
```

## Docs

Additional documents are in `docs/`:

- `docs/CHECKLIST.md`
- `docs/DATABASE_SETUP.md`
- `docs/FILES_REFERENCE.md`
- `docs/IMPLEMENTATION_SUMMARY.md`
- `docs/INSTALL_POSTGRESQL.md`
- `docs/MIGRATIONS.md`
- `docs/QUICK_REFERENCE.md`
- `docs/RUNNING_STATUS.md`
- `docs/SETUP_GUIDE.md`

## Deployment Notes

- Use strong secrets for `NEXTAUTH_SECRET` and backend `SECRET_KEY`.
- Configure CORS and allowed origins for production.
- Use HTTPS and a managed Postgres instance for production deployments.
- Consider separate databases for frontend auth tables and backend API tables.

## Contributing

1. Create a feature branch.
2. Make changes with tests where appropriate.
3. Submit a pull request.

## License

Proprietary. All rights reserved.

