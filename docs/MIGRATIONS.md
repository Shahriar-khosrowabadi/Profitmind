# Database Migration Guide

This guide explains how to set up and use Alembic for database migrations.

## Initial Setup

### 1. Initialize Alembic (if not already done)

```powershell
cd backend
alembic init alembic
```

### 2. Configure alembic.ini

Edit `backend/alembic.ini` and update the database URL:

```ini
sqlalchemy.url = postgresql+asyncpg://financial_admin:password@localhost/financial_ai
```

### 3. Configure env.py

Edit `backend/alembic/env.py` to use your async engine:

```python
from backend.database import engine, Base
from backend.models import User, MarketData

target_metadata = Base.metadata

config.set_main_option(
    "sqlalchemy.url",
    "postgresql+asyncpg://financial_admin:password@localhost/financial_ai"
)
```

## Creating Migrations

### 1. Auto-generate migration

After modifying models, run:

```powershell
alembic revision --autogenerate -m "Add new columns"
```

### 2. Review the generated migration

Check the generated file in `alembic/versions/`

### 3. Apply the migration

```powershell
alembic upgrade head
```

## Common Commands

### View migration history

```powershell
alembic history
```

### Current revision

```powershell
alembic current
```

### Downgrade one revision

```powershell
alembic downgrade -1
```

### Downgrade to specific revision

```powershell
alembic downgrade <revision_id>
```

## Database Setup Without Alembic

If you prefer to set up tables manually, the application will create them automatically on startup via the `init_db()` function in `database.py`.

To verify tables were created:

```sql
\dt  -- In psql
```

## Troubleshooting

### AsyncIO error with alembic

Use blocking SQL for migrations. Alembic doesn't natively support async.

### Migration won't apply

1. Verify database connection
2. Check migration syntax
3. Ensure previous migrations are applied

### Tables don't exist after startup

1. Check database connection in `.env`
2. Verify `init_db()` is being called
3. Check backend logs for errors

## Data Seeding

To seed initial data after migrations, create a seed function in `backend/main.py`:

```python
async def seed_data():
    async with AsyncSessionLocal() as session:
        # Add seed data here
        session.add(User(...))
        await session.commit()
```

Call it during startup:

```python
@app.on_event("startup")
async def startup():
    await init_db()
    # await seed_data()  # Uncomment to seed
```
