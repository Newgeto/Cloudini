from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Fichier SQLite local, stocké dans le répertoire de travail de l'API.
SQLALCHEMY_DATABASE_URL = "sqlite:///./cloudini.db"

# check_same_thread est requis pour SQLite avec le pool de threads de FastAPI.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dépendance FastAPI qui fournit une session de base de données et la ferme toujours."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
