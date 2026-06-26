from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FolderCreate(BaseModel):
    """Données reçues à la création d'un dossier."""

    name: str = Field(min_length=1, max_length=100)
    parent_id: int | None = None


class FolderUpdate(BaseModel):
    """Renommage et/ou déplacement d'un dossier (champs optionnels)."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    parent_id: int | None = None
    # Permet de distinguer « déplacer à la racine » d'un champ absent.
    move: bool = False


class FolderRead(BaseModel):
    """Métadonnées d'un dossier renvoyées au client."""

    id: int
    name: str
    parent_id: int | None = None
    created_at: datetime
    deleted_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
