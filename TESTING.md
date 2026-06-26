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

# Envoyer un fichier (multipart, champ "upload")
curl -X POST http://127.0.0.1:8000/files \
  -H "Authorization: Bearer <TOKEN>" \
  -F "upload=@chemin/vers/mon_fichier.txt"

# Lister ses fichiers
curl http://127.0.0.1:8000/files -H "Authorization: Bearer <TOKEN>"

# Télécharger un fichier (remplace <ID>)
curl -OJ http://127.0.0.1:8000/files/<ID>/download \
  -H "Authorization: Bearer <TOKEN>"

# Supprimer un fichier
curl -X DELETE http://127.0.0.1:8000/files/<ID> \
  -H "Authorization: Bearer <TOKEN>"
```

## 5. Endpoints disponibles

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET`  | `/`              | non | Health check (`{"status":"ok"}`) |
| `POST` | `/auth/register` | non | Crée un utilisateur (`email`, `password`) |
| `POST` | `/auth/login`    | non | Renvoie un token JWT (form `username`/`password`) |
| `GET`  | `/auth/me`       | oui | Renvoie l'utilisateur authentifié |
| `POST`   | `/files`                | oui | Envoie un fichier (multipart, champ `upload`) |
| `GET`    | `/files`                | oui | Liste les fichiers (pagination : `?limit=50&offset=0`) |
| `GET`    | `/files/{id}/download`  | oui | Télécharge un de ses fichiers |
| `DELETE` | `/files/{id}`           | oui | Supprime un de ses fichiers |

## 6. Codes de réponse attendus

| Cas | Code |
|---|---|
| Inscription réussie | `201` |
| Email déjà utilisé | `400` |
| Email invalide / mot de passe trop court | `422` |
| Connexion réussie | `200` |
| Mauvais identifiants | `401` |
| Route protégée sans token / token invalide | `401` |
| Upload réussi | `201` |
| Suppression réussie | `204` |
| Fichier d'un autre utilisateur / inexistant | `404` |
| Fichier vide / aucun fichier | `400` |
| Extension non autorisée | `415` |
| Fichier trop volumineux (> `MAX_UPLOAD_MB`) | `413` |
| `limit`/`offset` hors bornes | `422` |

## 7. Limites de l'upload (configurables via `.env`)

- `MAX_UPLOAD_MB` : taille maximale d'un fichier (défaut **10 Mo**).
- `ALLOWED_EXTENSIONS` : extensions acceptées (vide = toutes). Défaut :
  `txt, md, csv, pdf, png, jpg, jpeg, gif, webp, doc, docx, xls, xlsx, zip`.
- `GET /files` est paginé : `limit` (1–100, défaut 50) et `offset` (≥ 0).
