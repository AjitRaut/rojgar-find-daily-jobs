# Rojgar Find – Daily Jobs Architecture

## Modules

- Auth + RBAC
- Worker Profiles
- Job Management
- AI Services
- Admin Metrics

## ER (Simplified)

- users (1) -> (0/1) worker_profiles
- users (1) -> (many) jobs
- worker_profiles -> AI suggestions

## API Prefix

- `/api/v1/auth`
- `/api/v1/jobs`
- `/api/v1/workers`
- `/api/v1/ai`
- `/api/v1/admin`

## Scaling Plan

- Phase 1: modular monolith
- Phase 2: cache + queue + observability
- Phase 3: tenant support + advanced analytics
