db:
    psql postgresql://appuser:apppassword@localhost:5433/appdb

up:
    docker compose up -d

down: 
    docker compose down 

back:
    cd src/backend && .venv/bin/python -m uvicorn app.main:app --reload

front:
    cd src/frontend && npm run dev

start:
    just back & just front

pipeline *ARGS:
    cd src/backend && .venv/bin/python data/pipeline.py {{ARGS}}

seed *ARGS:
    cd src/backend && .venv/bin/python data/seed_db.py {{ARGS}}

setup:
    just up
    sleep 2
    just seed

