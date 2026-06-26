import os
from pathlib import Path

from dotenv import load_dotenv

# Charge les variables définies dans api/.env (si présent).
load_dotenv()

# Clé secrète de signature des JWT. À surcharger via la variable d'environnement
# SECRET_KEY en production (ne jamais committer une vraie clé).
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-a-changer-en-prod")

# Algorithme de signature des tokens.
ALGORITHM = "HS256"

# Durée de validité d'un token d'accès, en minutes.
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Dossier de stockage des fichiers uploadés (relatif au répertoire de travail de l'API).
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "storage"))

# Origines autorisées à appeler l'API depuis un navigateur (CORS).
# Liste séparée par des virgules ; défaut = le serveur de dev Vite.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

# Taille maximale d'un fichier uploadé, en méga-octets.
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_SIZE = MAX_UPLOAD_MB * 1024 * 1024

# Extensions de fichiers autorisées (sans le point), séparées par des virgules.
# Laisser vide pour autoriser tous les types.
ALLOWED_EXTENSIONS = {
    ext.strip().lstrip(".").lower()
    for ext in os.getenv(
        "ALLOWED_EXTENSIONS",
        "txt,md,csv,pdf,png,jpg,jpeg,gif,webp,doc,docx,xls,xlsx,zip",
    ).split(",")
    if ext.strip()
}
