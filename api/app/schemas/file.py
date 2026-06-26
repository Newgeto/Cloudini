from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FileRead(BaseModel):
    """Métadonnées d'un fichier renvoyées au client."""

    id: int
    filename: str
    folder_id: int | None = None
    created_at: datetime
    deleted_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class FileUpdate(BaseModel):
    """Renommage et/ou déplacement d'un fichier (champs optionnels)."""

    filename: str | None = Field(default=None, min_length=1, max_length=255)
    folder_id: int | None = None
    # Distingue « déplacer à la racine » (folder_id=null) d'un champ absent.
    move: bool = False
