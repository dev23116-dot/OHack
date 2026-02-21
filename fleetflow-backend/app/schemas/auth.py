from pydantic import BaseModel

from app.schemas.common import model_config_camel


class Token(BaseModel):
    model_config = model_config_camel

    access_token: str
    token_type: str = "bearer"
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str | None = None
