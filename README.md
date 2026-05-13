# Rojgar Find – Daily Jobs

AI-powered workforce hiring platform for rural and semi-urban regions.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Axios, React Hook Form, Zod
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, Alembic
- Database: PostgreSQL
- AI: OpenAI API (chat, recommendations, profile suggestions)

## Monorepo Structure

- `apps/web` - Next.js app (customer, worker, admin dashboards)
- `apps/api` - FastAPI app (modular API and AI services)
- `infra` - deployment and environment templates
- `docs` - architecture and viva notes

## Quick Start

### 1) Backend

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd apps/web
npm install
copy .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`.

## MVP Modules Included

- JWT auth with RBAC (`customer`, `worker`, `admin`)
- Worker profiles and skills
- Job posting and worker recommendations
- AI chatbot and profile suggestion endpoints
- Admin metrics endpoint

## Phase Upgrades

- Phase 2: notifications, deeper analytics, object storage uploads
- Phase 3: payment escrow, geo expansion, advanced forecasting
