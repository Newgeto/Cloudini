from contextlib import asynccontextmanager

from fastapi import FastAPI

import models  # noqa: F401  (ensures models are registered on Base before create_all)
from database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables at startup.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cloudini", lifespan=lifespan)


@app.get("/")
def health_check():
    return {"status": "ok"}
