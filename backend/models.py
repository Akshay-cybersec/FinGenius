from pydantic import BaseModel

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