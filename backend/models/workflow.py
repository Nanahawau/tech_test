from pydantic import BaseModel, ConfigDict, field_validator

class Workflow(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str

    @field_validator("title")
    @classmethod
    def non_empty_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Workflow title must be non-empty")
        return v