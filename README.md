# Cloudini

Mini application de stockage de fichiers (style Dropbox simplifié).

## Stack

- **Backend** : FastAPI (Python) + SQLAlchemy + SQLite
- **Frontend** : React + Vite
- **Auth** (prévue) : JWT via `passlib` + `python-jose`
- **Stockage** : fichiers sur disque local (`backend/storage/`)

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1      # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- Health check : http://127.0.0.1:8000/ → `{"status": "ok"}`
- Docs : http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

- Dev : http://localhost:5173
