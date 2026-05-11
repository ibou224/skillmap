from fastapi import FastAPI

app = FastAPI(title="Skillmap-API")

@app.get("/health")
def health():
    return {"status": "ok"}