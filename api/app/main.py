from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import models  # noqa: F401  (registers models on Base before create_all)
from app.db.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables at startup.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cloudini", lifespan=lifespan)


@app.get("/")
def health_check():
    return {"status": "ok"}
