from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (enregistre les modèles sur Base avant create_all)
from app.core.config import CORS_ORIGINS
from app.db.database import Base, engine
from app.routers import auth, files, folders


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crée les tables de la base de données au démarrage.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cloudini", lifespan=lifespan)

# Autorise le frontend (navigateur) à appeler l'API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(folders.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
