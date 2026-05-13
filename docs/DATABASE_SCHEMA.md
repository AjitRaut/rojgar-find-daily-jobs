# Database Schema (MVP)

## users
- id (PK)
- full_name
- email (unique)
- password_hash
- role (`customer|worker|admin`)
- city
- created_at

## worker_profiles
- id (PK)
- user_id (FK -> users.id, unique)
- bio
- experience_years
- hourly_rate
- rating_avg
- total_jobs
- verification_status

## jobs
- id (PK)
- customer_id (FK -> users.id)
- title
- description
- category
- budget
- location
- status (`open|assigned|completed|cancelled`)
- created_at
