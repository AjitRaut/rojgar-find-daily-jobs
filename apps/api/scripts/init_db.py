"""Create all database tables from SQLAlchemy models.

Run once per empty database (e.g. new Neon project), before seed_data or the API.

Usage (from apps/api, venv active):
  set PYTHONPATH=.
  python scripts/init_db.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import Base, engine  # noqa: E402
import app.models.entities  # noqa: F401, E402  # registers models on Base.metadata


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


if __name__ == "__main__":
    main()
