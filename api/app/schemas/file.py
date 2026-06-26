from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FileRead(BaseModel):
    """Métadonnées d'un fichier renvoyées au client."""

    id: int
    filename: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
