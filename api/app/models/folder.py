from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from app.db.database import Base


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # parent_id nul = dossier à la racine.
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    # Suppression douce : non nul = dossier dans la corbeille.
    deleted_at = Column(DateTime, nullable=True, default=None)

    # Self-référence : un dossier a des sous-dossiers et un parent.
    children = relationship("Folder", backref=backref("parent", remote_side=[id]))
    files = relationship("File", back_populates="folder")
