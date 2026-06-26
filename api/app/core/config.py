import os

# Clé secrète de signature des JWT. À surcharger via la variable d'environnement
# SECRET_KEY en production (ne jamais committer une vraie clé).
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-a-changer-en-prod")

# Algorithme de signature des tokens.
ALGORITHM = "HS256"

# Durée de validité d'un token d'accès, en minutes.
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
