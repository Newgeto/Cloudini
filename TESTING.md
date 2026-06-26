# Tester l'API Cloudini

Ce guide explique comment lancer et tester l'API d'authentification.

## 1. Lancer l'API

```powershell
cd api
venv\Scripts\Activate.ps1      # Windows PowerShell
uvicorn app.main:app --reload
```

L'API démarre sur **http://127.0.0.1:8000**.

## 2. Tester via la doc interactive (le plus simple)

Ouvre **http://127.0.0.1:8000/docs** (Swagger UI) :

1. `POST /auth/register` → renseigne `email` + `password` (≥ 8 caractères), exécute.
2. `POST /auth/login` → renseigne les mêmes identifiants, récupère le `access_token`.
3. Clique sur **Authorize** (en haut à droite), colle le token, valide.
4. `GET /auth/me` → renvoie l'utilisateur connecté.

## 3. Tester via Postman

1. Ouvre Postman → **Import** → sélectionne [`Cloudini.postman_collection.json`](Cloudini.postman_collection.json).
2. Lance les requêtes dans l'ordre : **Health check → Register → Login → Me**.
3. Après un **Login** réussi, le token est automatiquement enregistré dans la
   variable `{{access_token}}` ; la requête **Me** l'utilise sans manipulation.

Variables de collection modifiables (onglet *Variables*) : `baseUrl`, `email`, `password`.

## 4. Tester via curl

```bash
# Health check
curl http://127.0.0.1:8000/

# Inscription
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"yanis@test.fr","password":"motdepasse123"}'

# Connexion (form OAuth2) → renvoie le token
curl -X POST http://127.0.0.1:8000/auth/login \
  -d "username=yanis@test.fr&password=motdepasse123"

# Accès à une route protégée (remplace <TOKEN>)
curl http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## 5. Endpoints disponibles

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET`  | `/`              | non | Health check (`{"status":"ok"}`) |
| `POST` | `/auth/register` | non | Crée un utilisateur (`email`, `password`) |
| `POST` | `/auth/login`    | non | Renvoie un token JWT (form `username`/`password`) |
| `GET`  | `/auth/me`       | oui | Renvoie l'utilisateur authentifié |

## 6. Codes de réponse attendus

| Cas | Code |
|---|---|
| Inscription réussie | `201` |
| Email déjà utilisé | `400` |
| Email invalide / mot de passe trop court | `422` |
| Connexion réussie | `200` |
| Mauvais identifiants | `401` |
| Route protégée sans token / token invalide | `401` |
