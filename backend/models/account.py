from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

class Account(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_uuid: UUID
    account_label: str

    @field_validator("account_label")
    @classmethod
    def non_empty_label(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Account Label must be non-empty")
        return v