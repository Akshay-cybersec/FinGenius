from fastapi import APIRouter, Depends, HTTPException
from database import users_col
from auth import get_current_user
from services import update_user_activity

router = APIRouter()

@router.get("/user")
def get_user_details(clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    user = users_col.find_one({"clerk_id": clerk_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user