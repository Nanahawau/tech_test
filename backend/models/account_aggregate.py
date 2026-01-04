from pydantic import BaseModel, ConfigDict, Field

from models.account import Account
from models.subscription import Subscription
from models.usage import Usage
from models.workflow import Workflow

class AccountAggregate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account: Account
    subscription: Subscription
    usage: Usage
    workflows: list[Workflow] = Field(default_factory=list)