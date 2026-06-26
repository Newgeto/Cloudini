from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Données reçues à l'inscription."""

    email: EmailStr
    password: str = Field(min_length=8)


class PasswordChange(BaseModel):
    """Données reçues pour changer le mot de passe."""

    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class UserRead(BaseModel):
    """Données utilisateur renvoyées au client (jamais le mot de passe)."""

    id: int
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
