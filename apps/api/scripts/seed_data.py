"""Seed skills catalog and bootstrap admin. Run after tables exist (see scripts/init_db.py).

Usage (from apps/api, with env loaded):
  set PYTHONPATH=.
  python scripts/seed_data.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.entities import Skill, User, UserRole  # noqa: E402

SKILLS = [
    ("electrician", "Electrician", "Electrical"),
    ("plumber", "Plumber", "Plumbing"),
    ("painter", "Painter", "Finishing"),
    ("carpenter", "Carpenter", "Woodwork"),
    ("mason", "Mason", "Construction"),
    ("laborer", "General labor", "Construction"),
    ("technician", "Technician", "Appliance / HVAC"),
]

ADMIN_EMAIL = "admin@rojgar-find.local"
ADMIN_PASSWORD = "Admin123!"


def run(db: Session) -> None:
    for slug, name, category in SKILLS:
        exists = db.query(Skill).filter(Skill.slug == slug).first()
        if not exists:
            db.add(Skill(slug=slug, name=name, category=category))

    if not db.query(User).filter(User.email == ADMIN_EMAIL).first():
        db.add(
            User(
                full_name="Platform Admin",
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                role=UserRole.admin,
            )
        )

    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        run(db)
        print("Seed complete. Admin login:", ADMIN_EMAIL, "/", ADMIN_PASSWORD)
    finally:
        db.close()


if __name__ == "__main__":
    main()
