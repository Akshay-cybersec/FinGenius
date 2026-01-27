from pydantic import BaseModel
from datetime import datetime

class TradeRequest(BaseModel):
    ticker: str
    qty: int

class QuizSubmission(BaseModel):
    score: int

class RedeemRequest(BaseModel):
    item_id: str

class LearningUpdate(BaseModel):
    module_id: str
    percentage: int
    xp_earned: int

class XPLogEntry(BaseModel):
    clerk_id: str
    amount: int 
    source: str  
    timestamp: datetime