from pydantic import BaseModel

from app.models.user import UserRole
from app.schemas.common import model_config_camel


class UserCreate(BaseModel):
    email: str
    password: str
    role: UserRole


class UserResponse(BaseModel):
    model_config = model_config_camel

    id: int
    email: str
    role: UserRole
