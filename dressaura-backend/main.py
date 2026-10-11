
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
    allow_origins=[
        "http://localhost:5173",
        "https://dressaura-frontend-gsko8c0xt-hiam-hasheems-projects.vercel.app",
        "https://dressaura-frontend-dnxadz4l5-hiam-hasheems-projects.vercel.app",
        "https://dressaura-frontend-jvup9t0uj-hiam-hasheems-projects.vercel.app",
    ],
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
