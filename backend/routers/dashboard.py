from datetime import datetime
from fastapi import APIRouter, Depends
from database import users_col
from auth import get_current_user
from services import update_user_activity

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    
    user = users_col.find_one({"clerk_id": clerk_id}, {"_id": 0})
    
    xp_needed = (user.get("level", 1) * 1000)
    progress_pct = (user.get("xp", 0) / xp_needed) * 100 if xp_needed > 0 else 0
    
    module_meta = {
        "budgeting": "Personal Budgeting",
        "investing": "Basics of Investing",
        "debt": "Debt Management"
    }
    
    user_modules = user.get("learning_progress", {})
    formatted_modules = []
    total_percentage = 0
    
    for mod_id, title in module_meta.items():
        data = user_modules.get(mod_id, {"percentage": 0, "xp": 0, "status": "not_started"})
        
        formatted_modules.append({
            "module_id": mod_id,
            "title": title,
            "completion_percentage": data.get("percentage", 0),
            "xp_earned": data.get("xp", 0),
            "status": data.get("status", "not_started")
        })
        total_percentage += data.get("percentage", 0)
        
    avg_completion = round(total_percentage / len(module_meta)) if module_meta else 0

    total_users = users_col.count_documents({})
    user_rank = users_col.count_documents({"xp": {"$gt": user.get("xp", 0)}}) + 1
    
    top_docs = list(users_col.find({}, {"_id": 0, "clerk_id": 1, "name": 1, "xp": 1, "level": 1})
                    .sort("xp", -1)
                    .limit(3))
    
    top_users_formatted = []
    for idx, doc in enumerate(top_docs):
        top_users_formatted.append({
            "rank": idx + 1,
            "user_id": doc.get("clerk_id"), 
            "name": doc.get("name", f"User {str(doc.get('clerk_id'))[-4:]}"), 
            "xp": doc.get("xp", 0),
            "level": doc.get("level", 1)
        })

    return {
        "user_data": {
            "balance": user["balance"],
            "level": user.get("level", 1),
            "xp": user.get("xp", 0),
            "streak": user.get("streak", {}).get("current", 0)
        },
        "progress": {
            "current_xp": user.get("xp", 0),
            "needed_xp": xp_needed,
            "percentage": round(min(progress_pct, 100), 1)
        },
        "track_progress": {
            "overall_completion": avg_completion,
            "modules": formatted_modules,
            "milestones": user.get("milestones", {
                "first_quiz_completed": False,
                "budget_simulator_used": False,
                "first_investment_simulation": False
            })
        },
        "leaderboard": {
            "batch_id": "finquest_batch_2026",
            "user_rank": user_rank,
            "total_users": total_users,
            "top_users": top_users_formatted
        },
        "activity_log": user.get("activity_log", []),
        "daily_quiz": {
            "attempted": user.get("daily_quiz", {}).get("last_attempt_date") == datetime.utcnow().strftime("%Y-%m-%d"),
            "score": user.get("daily_quiz", {}).get("score", 0)
        }
    }

@router.get("/leaderboard")
def get_leaderboard():
    top_users = list(users_col.find(
        {}, 
        {"_id": 0, "clerk_id": 1, "xp": 1, "level": 1, "streak": 1}
    ).sort("xp", -1).limit(10))
    return top_users