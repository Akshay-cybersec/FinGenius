import os
import random
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["finquest"]
users_col = db["users"]

# --- Dummy Data Generator ---
def generate_dummy_users():
    dummy_users = [
        {"name": "Aarav Patel", "id": "user_dummy_01"},
        {"name": "Sneha Reddy", "id": "user_dummy_02"},
        {"name": "Rohan Gupta", "id": "user_dummy_03"},
        {"name": "Ishita Sharma", "id": "user_dummy_04"},
        {"name": "Vikram Singh", "id": "user_dummy_05"},
        {"name": "Ananya Das", "id": "user_dummy_06"},
        {"name": "Kabir Mehta", "id": "user_dummy_07"},
        {"name": "Zara Khan", "id": "user_dummy_08"},
        {"name": "Arjun Nair", "id": "user_dummy_09"},
        {"name": "Priya Kapoor", "id": "user_dummy_10"},
    ]

    new_users = []
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    for user in dummy_users:
        # Randomize stats to make leaderboard look natural
        level = random.randint(2, 8)
        xp = (level * 1000) + random.randint(100, 900) # Ensure XP matches level roughly
        balance = random.randint(50000, 150000)
        streak = random.randint(3, 20)
        
        doc = {
            "clerk_id": user["id"],
            "name": user["name"],
            "balance": balance,
            "level": level,
            "xp": xp,
            "streak": {
                "current": streak,
                "last_active_date": today_str
            },
            "activity_log": [today_str], # Just one entry is enough for dummies
            "daily_quiz": {
                "last_attempt_date": today_str if random.choice([True, False]) else "",
                "score": random.randint(5, 10)
            },
            "learning_progress": {
                "budgeting": {"percentage": random.randint(20, 100), "xp": 100, "status": "in_progress"},
                "investing": {"percentage": random.randint(0, 80), "xp": 50, "status": "in_progress"},
                "debt": {"percentage": 0, "xp": 0, "status": "not_started"}
            },
            "milestones": {
                "first_quiz_completed": True,
                "budget_simulator_used": True,
                "first_investment_simulation": True
            }
        }
        new_users.append(doc)
    
    return new_users

# --- Execution ---
def seed_db():
    # Optional: Clear existing dummy users to avoid duplicates if you run this twice
    # users_col.delete_many({"clerk_id": {"$regex": "user_dummy_"}}) 
    
    data = generate_dummy_users()
    
    try:
        # Use ordered=False to continue inserting even if one ID already exists
        result = users_col.insert_many(data, ordered=False)
        print(f"✅ Successfully added {len(result.inserted_ids)} new competitors to the Leaderboard!")
    except Exception as e:
        print(f"⚠️ Some users might already exist. Added what we could.")
        # print(e) # Uncomment to see full error

if __name__ == "__main__":
    seed_db()