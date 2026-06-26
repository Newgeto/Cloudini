from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # folder_id nul = fichier à la racine.
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    # Suppression douce : non nul = fichier dans la corbeille.
    deleted_at = Column(DateTime, nullable=True, default=None)

    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
