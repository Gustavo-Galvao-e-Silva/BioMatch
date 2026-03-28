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

