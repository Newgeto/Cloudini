import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import STORAGE_DIR
from app.db.database import get_db
from app.models.file import File as FileModel
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.file import FileRead

router = APIRouter(prefix="/files", tags=["files"])


def _get_owned_file(file_id: int, db: Session, current_user: User) -> FileModel:
    """Récupère un fichier en s'assurant qu'il appartient à l'utilisateur courant."""
    record = db.get(FileModel, file_id)
    if record is None or record.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier introuvable.",
        )
    return record


@router.post("", response_model=FileRead, status_code=status.HTTP_201_CREATED)
def upload_file(
    upload: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Envoie un fichier et enregistre ses métadonnées."""
    if not upload.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun fichier fourni.",
        )

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    # Nom de stockage unique pour éviter les collisions ; le nom d'origine reste en base.
    stored_name = f"{uuid.uuid4().hex}{Path(upload.filename).suffix}"
    destination = STORAGE_DIR / stored_name
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)

    record = FileModel(
        filename=upload.filename,
        path=str(destination),
        owner_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[FileRead])
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Liste les fichiers de l'utilisateur courant."""
    return (
        db.query(FileModel)
        .filter(FileModel.owner_id == current_user.id)
        .order_by(FileModel.created_at.desc())
        .all()
    )


@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Télécharge un fichier appartenant à l'utilisateur courant."""
    record = _get_owned_file(file_id, db, current_user)
    path = Path(record.path)
    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier absent du stockage.",
        )
    return FileResponse(path, filename=record.filename)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime un fichier (disque + base)."""
    record = _get_owned_file(file_id, db, current_user)
    Path(record.path).unlink(missing_ok=True)
    db.delete(record)
    db.commit()
