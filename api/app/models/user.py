from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.ids import generate_snowflake
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Identifiant public façon Discord (snowflake) : c'est lui qu'on affiche,
    # jamais l'id séquentiel interne.
    public_id = Column(String, unique=True, index=True, nullable=False, default=generate_snowflake)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

    files = relationship("File", back_populates="owner")
