from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import models  # noqa: F401  (enregistre les modèles sur Base avant create_all)
from app.db.database import Base, engine
from app.routers import auth, files


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crée les tables de la base de données au démarrage.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cloudini", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(files.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
