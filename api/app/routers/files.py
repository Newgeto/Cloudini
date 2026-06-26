import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_MB, MAX_UPLOAD_SIZE, STORAGE_DIR
from app.db.database import get_db
from app.models.file import File as FileModel
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.file import FileRead

router = APIRouter(prefix="/files", tags=["files"])

# Taille des morceaux lus pendant l'upload (1 Mo).
_CHUNK_SIZE = 1024 * 1024


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
    """Envoie un fichier et enregistre ses métadonnées.

    Contrôles : nom présent, extension autorisée, fichier non vide, taille max.
    """
    if not upload.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun fichier fourni.",
        )

    extension = Path(upload.filename).suffix.lower()
    if ALLOWED_EXTENSIONS and extension.lstrip(".") not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Type de fichier non autorisé. Extensions acceptées : "
            f"{', '.join(sorted(ALLOWED_EXTENSIONS))}.",
        )

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    # Nom de stockage unique pour éviter les collisions ; le nom d'origine reste en base.
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = STORAGE_DIR / stored_name

    # Écriture en streaming avec contrôle de la taille pour éviter de charger
    # tout le fichier en mémoire et de dépasser la limite autorisée.
    size = 0
    try:
        with destination.open("wb") as buffer:
            while chunk := upload.file.read(_CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Fichier trop volumineux (max {MAX_UPLOAD_MB} Mo).",
                    )
                buffer.write(chunk)
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Fichier vide.",
            )
    except HTTPException:
        # Nettoie le fichier partiellement écrit avant de propager l'erreur.
        destination.unlink(missing_ok=True)
        raise

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
    limit: int = Query(50, ge=1, le=100, description="Nombre maximum de fichiers renvoyés."),
    offset: int = Query(0, ge=0, description="Décalage pour la pagination."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Liste les fichiers de l'utilisateur courant (paginé, récents d'abord)."""
    return (
        db.query(FileModel)
        .filter(FileModel.owner_id == current_user.id)
        .order_by(FileModel.created_at.desc())
        .offset(offset)
        .limit(limit)
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
