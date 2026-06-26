from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.file import File as FileModel
from app.models.folder import Folder
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.folder import FolderCreate, FolderRead, FolderUpdate

router = APIRouter(prefix="/folders", tags=["folders"])


def _get_owned_folder(folder_id: int, db: Session, current_user: User) -> Folder:
    """Récupère un dossier en vérifiant qu'il appartient à l'utilisateur courant."""
    folder = db.get(Folder, folder_id)
    if folder is None or folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dossier introuvable.",
        )
    return folder


def _subtree_folder_ids(db: Session, root: Folder, owner_id: int) -> list[int]:
    """Renvoie les ids du dossier et de tous ses descendants (parcours en largeur)."""
    ids = [root.id]
    frontier = [root.id]
    while frontier:
        children = (
            db.query(Folder.id)
            .filter(Folder.owner_id == owner_id, Folder.parent_id.in_(frontier))
            .all()
        )
        frontier = [c.id for c in children]
        ids.extend(frontier)
    return ids


def _validate_parent(parent_id: int | None, db: Session, current_user: User) -> None:
    """Vérifie que le parent existe, appartient à l'utilisateur et n'est pas en corbeille."""
    if parent_id is None:
        return
    parent = _get_owned_folder(parent_id, db, current_user)
    if parent.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le dossier de destination est dans la corbeille.",
        )


@router.post("", response_model=FolderRead, status_code=status.HTTP_201_CREATED)
def create_folder(
    payload: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crée un dossier (à la racine ou dans un dossier parent)."""
    _validate_parent(payload.parent_id, db, current_user)
    folder = Folder(
        name=payload.name.strip(),
        owner_id=current_user.id,
        parent_id=payload.parent_id,
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.get("", response_model=list[FolderRead])
def list_folders(
    parent: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Liste les sous-dossiers (non supprimés) d'un dossier (parent omis = racine)."""
    return (
        db.query(Folder)
        .filter(
            Folder.owner_id == current_user.id,
            Folder.parent_id.is_(parent) if parent is None else Folder.parent_id == parent,
            Folder.deleted_at.is_(None),
        )
        .order_by(Folder.name.asc())
        .all()
    )


@router.get("/trash", response_model=list[FolderRead])
def list_trash_folders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dossiers en corbeille au niveau supérieur (parent non supprimé)."""
    trashed = (
        db.query(Folder)
        .filter(Folder.owner_id == current_user.id, Folder.deleted_at.is_not(None))
        .order_by(Folder.deleted_at.desc())
        .all()
    )
    # On ne garde que les « racines » supprimées : parent absent ou non supprimé.
    deleted_ids = {f.id for f in trashed}
    return [f for f in trashed if f.parent_id is None or f.parent_id not in deleted_ids]


@router.get("/{folder_id}/breadcrumb", response_model=list[FolderRead])
def folder_breadcrumb(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie le chemin (de la racine au dossier) pour le fil d'Ariane."""
    folder = _get_owned_folder(folder_id, db, current_user)
    path: list[Folder] = []
    current: Folder | None = folder
    seen: set[int] = set()
    while current is not None and current.id not in seen:
        path.append(current)
        seen.add(current.id)
        current = db.get(Folder, current.parent_id) if current.parent_id else None
    return list(reversed(path))


@router.patch("/{folder_id}", response_model=FolderRead)
def update_folder(
    folder_id: int,
    payload: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renomme et/ou déplace un dossier."""
    folder = _get_owned_folder(folder_id, db, current_user)

    if payload.name is not None:
        folder.name = payload.name.strip()

    if payload.move:
        if payload.parent_id == folder.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un dossier ne peut pas se contenir lui-même.",
            )
        _validate_parent(payload.parent_id, db, current_user)
        # Interdit de déplacer un dossier dans l'un de ses propres descendants.
        if payload.parent_id in _subtree_folder_ids(db, folder, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de déplacer un dossier dans l'un de ses sous-dossiers.",
            )
        folder.parent_id = payload.parent_id

    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Place un dossier et tout son contenu dans la corbeille (récursif)."""
    folder = _get_owned_folder(folder_id, db, current_user)
    ids = _subtree_folder_ids(db, folder, current_user.id)
    now = datetime.now(timezone.utc)
    db.query(Folder).filter(Folder.id.in_(ids), Folder.deleted_at.is_(None)).update(
        {Folder.deleted_at: now}, synchronize_session=False
    )
    db.query(FileModel).filter(
        FileModel.folder_id.in_(ids), FileModel.deleted_at.is_(None)
    ).update({FileModel.deleted_at: now}, synchronize_session=False)
    db.commit()


@router.post("/{folder_id}/restore", response_model=FolderRead)
def restore_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Restaure un dossier et tout son contenu depuis la corbeille (récursif)."""
    folder = _get_owned_folder(folder_id, db, current_user)
    # Si le parent a disparu de la corbeille, on remonte le dossier à la racine.
    if folder.parent_id is not None:
        parent = db.get(Folder, folder.parent_id)
        if parent is None or parent.deleted_at is not None:
            folder.parent_id = None
    ids = _subtree_folder_ids(db, folder, current_user.id)
    db.query(Folder).filter(Folder.id.in_(ids)).update(
        {Folder.deleted_at: None}, synchronize_session=False
    )
    db.query(FileModel).filter(FileModel.folder_id.in_(ids)).update(
        {FileModel.deleted_at: None}, synchronize_session=False
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/{folder_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder_permanent(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime définitivement un dossier, ses sous-dossiers et leurs fichiers."""
    folder = _get_owned_folder(folder_id, db, current_user)
    ids = _subtree_folder_ids(db, folder, current_user.id)
    files = db.query(FileModel).filter(FileModel.folder_id.in_(ids)).all()
    for record in files:
        Path(record.path).unlink(missing_ok=True)
        db.delete(record)
    # Supprime les dossiers en partant des feuilles pour respecter les FK.
    for fid in reversed(ids):
        node = db.get(Folder, fid)
        if node is not None:
            db.delete(node)
    db.commit()
