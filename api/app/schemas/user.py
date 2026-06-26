from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Données reçues à l'inscription."""

    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    username: str = Field(min_length=3, max_length=30)
    phone: str = Field(min_length=6, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8)


class PasswordChange(BaseModel):
    """Données reçues pour changer le mot de passe."""

    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class UserRead(BaseModel):
    """Données utilisateur renvoyées au client (jamais le mot de passe)."""

    public_id: str
    first_name: str
    last_name: str
    username: str
    phone: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
