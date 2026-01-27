from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from database import users_col
from auth import get_current_user
from services import update_user_activity
from models import QuizSubmission, LearningUpdate

router = APIRouter()

@router.post("/learning/update")
def update_learning_progress(data: LearningUpdate, clerk_id: str = Depends(get_current_user)):
    status = "completed" if data.percentage >= 100 else "in_progress"
    
    update_query = {
        "$set": {
            f"learning_progress.{data.module_id}.percentage": data.percentage,
            f"learning_progress.{data.module_id}.status": status,
            "milestones.budget_simulator_used": True if data.module_id == "budgeting" and data.percentage > 0 else None
        },
        "$inc": {
            f"learning_progress.{data.module_id}.xp": data.xp_earned,
            "xp": data.xp_earned
        }
    }
    
    update_query["$set"] = {k: v for k, v in update_query["$set"].items() if v is not None}

    users_col.update_one({"clerk_id": clerk_id}, update_query)
    update_user_activity(clerk_id)
    return {"message": "Progress updated"}

@router.post("/quiz/submit")
def submit_quiz(data: QuizSubmission, clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    if user.get("daily_quiz", {}).get("last_attempt_date") == today_str:
        raise HTTPException(status_code=400, detail="Quiz already attempted today")
    
    xp_gained = data.score * 10
    new_xp = user.get("xp", 0) + xp_gained
    
    current_level = user.get("level", 1)
    xp_threshold = current_level * 1000
    if new_xp >= xp_threshold:
        current_level += 1
        new_xp -= xp_threshold 
    
    users_col.update_one(
        {"clerk_id": clerk_id},
        {
            "$set": {
                "xp": new_xp, 
                "level": current_level,
                "daily_quiz": {"last_attempt_date": today_str, "score": data.score},
                "milestones.first_quiz_completed": True
            }
        }
    )
    update_user_activity(clerk_id)
    return {"message": "Quiz Submitted", "xp_gained": xp_gained, "new_level": current_level}