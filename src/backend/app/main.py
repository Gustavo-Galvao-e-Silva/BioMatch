from fastapi import FastAPI

app = FastAPI(title="AuraHack API", version="0.1.0")


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}


@app.get("/health")
def health():
    return {"status": "ok"}
