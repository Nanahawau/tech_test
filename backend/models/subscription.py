from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator

class SubscriptionStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class Subscription(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: SubscriptionStatus
    admin_seats: int = Field(ge=0)
    user_seats: int = Field(ge=0)
    read_only_seats: int = Field(ge=0)

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        if isinstance(v, str):
            v = v.strip().lower()
        return v