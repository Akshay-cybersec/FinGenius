from fastapi import APIRouter, Depends, HTTPException
from database import users_col, store_col
from auth import get_current_user
from models import RedeemRequest

router = APIRouter()

@router.get("/store")
def get_store_items(clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    user_inventory = user.get("inventory", []) 
    
    items = list(store_col.find({}, {"_id": 0}))
    
    for item in items:
        item["owned"] = item["item_id"] in user_inventory
        
    return items

@router.post("/store/redeem")
def redeem_item(data: RedeemRequest, clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    item = store_col.find_one({"item_id": data.item_id})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if data.item_id in user.get("inventory", []):
        raise HTTPException(status_code=400, detail="You already own this item")

    if user.get("xp", 0) < item["cost"]:
        raise HTTPException(status_code=400, detail="Insufficient XP")

    users_col.update_one(
        {"clerk_id": clerk_id},
        {
            "$inc": {"xp": -item["cost"]},
            "$push": {"inventory": data.item_id}
        }
    )
    
    return {
        "message": f"Successfully redeemed {item['name']}",
        "remaining_xp": user["xp"] - item["cost"],
        "item_id": data.item_id
    }

@router.get("/inventory")
def get_user_inventory(clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    inventory_ids = user.get("inventory", [])
    
    items = list(store_col.find({"item_id": {"$in": inventory_ids}}, {"_id": 0}))
    return items