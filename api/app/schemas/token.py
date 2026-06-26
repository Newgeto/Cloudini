from pydantic import BaseModel


class Token(BaseModel):
    """Token d'accès renvoyé à la connexion."""

    access_token: str
    token_type: str = "bearer"
