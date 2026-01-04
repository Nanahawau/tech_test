from pydantic import BaseModel, ConfigDict, Field

class Usage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_records: int = Field(ge=0)
    automation_count: int = Field(ge=0)
    messages_processed: int = Field(ge=0)
    notifications_sent: int = Field(ge=0)
    notifications_billed: int = Field(ge=0)