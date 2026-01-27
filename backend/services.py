import random
import asyncio
from datetime import datetime, timedelta
from database import users_col, assets_col
from socket_manager import manager

def update_user_activity(clerk_id: str):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    user = users_col.find_one({"clerk_id": clerk_id})

    default_learning = {
        "budgeting": {"percentage": 0, "xp": 0, "status": "not_started"},
        "investing": {"percentage": 0, "xp": 0, "status": "not_started"},
        "debt": {"percentage": 0, "xp": 0, "status": "not_started"}
    }
    
    default_milestones = {
        "first_quiz_completed": False,
        "budget_simulator_used": False,
        "first_investment_simulation": False
    }

    if not user:
        new_user = {
            "clerk_id": clerk_id,
            "name": "User", 
            "balance": 100000,
            "level": 1,
            "xp": 0,
            "streak": {"current": 1, "last_active_date": today_str},
            "activity_log": [today_str],
            "daily_quiz": {"last_attempt_date": "", "score": 0},
            "learning_progress": default_learning,
            "milestones": default_milestones,
            "inventory": []
        }
        users_col.insert_one(new_user)
        return

    streak_data = user.get("streak", {"current": 0, "last_active_date": ""})
    current_streak = streak_data.get("current", 0)
    last_active = streak_data.get("last_active_date", "")
    
    new_streak = current_streak
    if last_active == today_str:
        pass
    elif last_active == yesterday_str:
        new_streak += 1
    else:
        new_streak = 1

    update_fields = {
        "streak": {"current": new_streak, "last_active_date": today_str}
    }
    
    if "learning_progress" not in user:
        update_fields["learning_progress"] = default_learning
    if "milestones" not in user:
        update_fields["milestones"] = default_milestones
    if "inventory" not in user:
        update_fields["inventory"] = []

    users_col.update_one(
        {"clerk_id": clerk_id},
        {
            "$set": update_fields,
            "$addToSet": {"activity_log": today_str}
        }
    )

async def price_engine():
    while True:
        assets = list(assets_col.find())
        if not assets:
            await asyncio.sleep(5)
            continue
            
        for asset in assets:
            if asset["type"] == "Fixed Deposits": continue

            vol = 0.06 if asset["risk"] == "High" else 0.03 if asset["risk"] == "Medium" else 0.01
            change = random.uniform(-vol, vol)
            
            new_price = max(0.1, round(asset["price"] + asset["price"] * change, 2))
            change_pct = round(change * 100, 2)

            assets_col.update_one(
                {"_id": asset["_id"]},
                {"$set": {"price": new_price, "change": change_pct}}
            )

        updated_assets = list(assets_col.find({}, {"_id":0}))
        await manager.broadcast(updated_assets)
        await asyncio.sleep(2)