# Deploying Rojgar Find – Daily Jobs on Render (Balanced MVP)

This document describes a minimal production-style deployment: **PostgreSQL** + **FastAPI** + **Next.js** on [Render](https://render.com).

## 1) Prerequisites

- GitHub repository connected to Render
- OpenAI API key (optional; AI falls back to heuristics if empty)

## 2) Database

1. Create a **PostgreSQL** instance on Render.
2. Copy the **Internal Database URL** (or External for local tooling).

## 3) API service (Python / FastAPI)

1. Create a **Web Service**; root directory: `apps/api`.
2. Build command (example):

   ```bash
   pip install -r requirements.txt && alembic upgrade head && python scripts/seed_data.py
   ```

   For the first deploy you may run migrations only, then seed manually via shell if preferred.

3. Start command:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. Environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Render Postgres URL (use `postgresql+psycopg2://...` form) |
| `JWT_SECRET_KEY` | Long random string (signing JWTs) |
| `JWT_ALGORITHM` | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | e.g. `1440` for demo sessions |
| `OPENAI_API_KEY` | Optional |
| `CORS_ORIGINS` | Your Next.js URL, e.g. `https://your-app.onrender.com` |

## 4) Web service (Next.js)

1. Create a **Web Service**; root directory: `apps/web`.
2. Build: `npm install && npm run build`
3. Start: `npm run start`
4. Environment:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Public API base, e.g. `https://your-api.onrender.com/api/v1` |

## 5) Viva demo script (2 minutes)

1. Run migrations and seed (`scripts/seed_data.py`) so skills + admin exist.
2. Log in as admin (`admin@rojgar-find.local` / see seed script password) → open **Verifications**.
3. Register a **worker**, complete profile + skills → approve from admin.
4. Register a **customer** → **Find workers** → open profile → **Send job request**.
5. As worker → **Accept** → **Start** → **Complete**; as customer → **Leave review**.
6. Optional: show **AI assistant** and **Recommend workers** with `OPENAI_API_KEY` set.

## 6) AWS-ready notes (Phase 3)

- Move object storage to **S3**; serve via **CloudFront**.
- Add **Redis** for caching and rate limits; split read replicas when needed.
- Observability: ship logs to **CloudWatch** or **OpenTelemetry** collector.
