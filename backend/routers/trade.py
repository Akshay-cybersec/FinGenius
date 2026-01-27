from fastapi import APIRouter, Depends, HTTPException
from database import users_col, assets_col, portfolio_col
from auth import get_current_user
from services import update_user_activity
from models import TradeRequest

router = APIRouter()

@router.get("/portfolio")
def get_portfolio(clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    return list(portfolio_col.find({"clerk_id": clerk_id}, {"_id":0}))

@router.post("/trade/buy")
def buy_asset(data: TradeRequest, clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    
    asset = assets_col.find_one({"ticker": data.ticker})
    user = users_col.find_one({"clerk_id": clerk_id})
    
    if not asset: raise HTTPException(status_code=404, detail="Asset not found")
    
    cost = data.qty if asset["type"] == "Fixed Deposits" else asset["price"] * data.qty

    if user["balance"] < cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    users_col.update_one(
        {"clerk_id": clerk_id},
        {
            "$inc": {"balance": -cost},
            "$set": {"milestones.first_investment_simulation": True}
        }
    )
    
    portfolio_col.update_one(
        {"clerk_id": clerk_id, "ticker": data.ticker},
        {"$inc": {"quantity": data.qty}, "$setOnInsert": {"buy_price": asset["price"]}},
        upsert=True
    )
    return {"message": f"Bought {data.qty} {data.ticker}"}

@router.post("/trade/sell")
def sell_asset(data: TradeRequest, clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    
    holding = portfolio_col.find_one({"clerk_id": clerk_id, "ticker": data.ticker})
    asset = assets_col.find_one({"ticker": data.ticker})
    
    if not holding or holding["quantity"] < data.qty:
        raise HTTPException(status_code=400, detail="Not enough holdings")
    
    revenue = data.qty if asset["type"] == "Fixed Deposits" else asset["price"] * data.qty

    users_col.update_one({"clerk_id": clerk_id},{"$inc": {"balance": revenue}})
    
    if holding["quantity"] == data.qty:
        portfolio_col.delete_one({"_id": holding["_id"]})
    else:
        portfolio_col.update_one({"_id": holding["_id"]},{"$inc": {"quantity": -data.qty}})
    
    return {"message": f"Sold {data.qty} {data.ticker}"}