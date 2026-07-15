from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import dresses, auth
import os

app = FastAPI(title="Dressaura API")

os.makedirs("app/uploads/dresses", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(dresses.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Dressaura backend running"}
