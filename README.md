# Cloudini

Mini application de stockage de fichiers (style Dropbox simplifié).

## Stack

- **API** : FastAPI (Python) + SQLAlchemy + SQLite
- **Web** : React + Vite + Tailwind CSS
- **Auth** (prévue) : JWT via `passlib` + `python-jose`
- **Stockage** : fichiers sur disque local (`api/storage/`)

## API

```bash
cd api
python -m venv venv
venv\Scripts\Activate.ps1      # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- Health check : http://127.0.0.1:8000/ → `{"status": "ok"}`
- Docs : http://127.0.0.1:8000/docs

## Web

```bash
cd web
npm install
npm run dev
```

- Dev : http://localhost:5173
