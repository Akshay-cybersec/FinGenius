import os
import random
import asyncio
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from jose import jwt
from dotenv import load_dotenv
from pydantic import BaseModel
from contextlib import asynccontextmanager

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

# Initialize MongoDB
client = MongoClient(MONGO_URI)
db = client["finquest"]
users_col = db["users"]
assets_col = db["assets"]
portfolio_col = db["portfolio"]
store_col = db["store_items"]

# --- Models ---
class TradeRequest(BaseModel):
    ticker: str
    qty: int

class QuizSubmission(BaseModel):
    score: int  # e.g., 8 (out of 10)
    
class RedeemRequest(BaseModel):
    item_id: str

class LearningUpdate(BaseModel):
    module_id: str  # e.g., "budgeting", "investing", "debt"
    percentage: int # e.g., 100
    xp_earned: int  # e.g., 50

# --- Security ---
security = HTTPBearer()
jwks = requests.get(f"{CLERK_ISSUER}/.well-known/jwks.json").json()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}
        )
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Helper Functions ---

def update_user_activity(clerk_id: str):
    """
    Updates streak, activity log, and ensures all new DB fields (learning/milestones) exist.
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    user = users_col.find_one({"clerk_id": clerk_id})

    # Default structure for learning
    default_learning = {
        "budgeting": {"percentage": 0, "xp": 0, "status": "not_started"},
        "investing": {"percentage": 0, "xp": 0, "status": "not_started"},
        "debt": {"percentage": 0, "xp": 0, "status": "not_started"}
    }
    
    # Default milestones
    default_milestones = {
        "first_quiz_completed": False,
        "budget_simulator_used": False,
        "first_investment_simulation": False
    }

    if not user:
        # Create new user
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

    # Logic to update streak
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

    # Fields to update
    update_fields = {
        "streak": {"current": new_streak, "last_active_date": today_str}
    }
    
    # Self-Healing: Add missing fields if they don't exist
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
    """Simulates market movement in background"""
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Store Items
    if store_col.count_documents({}) == 0:
        store_col.insert_many([
            {
                "item_id": "shirt_finance_nerd",
                "name": "Finance Nerd T-Shirt",
                "description": "Premium cotton tee for the data-driven trader.",
                "cost": 1500,
                "type": "merch",
                "image_url": "https://m.media-amazon.com/images/I/A13usaonutL._CLa%7C2140%2C2000%7C61S701-4jZL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_UY1000_.png"
            },
            {
                "item_id": "mug_bull_market",
                "name": "Bull Market Coffee Mug",
                "description": "Start your trading day with bullish energy.",
                "cost": 800,
                "type": "merch",
                "image_url": "https://m.media-amazon.com/images/I/51r-7O-E+BL.jpg"
            },
            {
                "item_id": "hoodie_trader",
                "name": "Eat Sleep Trade Hoodie",
                "description": "Stay warm while watching the charts freeze.",
                "cost": 2500,
                "type": "merch",
                "image_url": "https://m.media-amazon.com/images/I/61kM2-2yJAL._AC_UY1000_.jpg"
            },
            {
                "item_id": "cap_buy_low",
                "name": "'Buy Low' Cap",
                "description": "The golden rule of investing, now on your head.",
                "cost": 1200,
                "type": "merch",
                "image_url": "https://m.media-amazon.com/images/I/61s+i-v87LL._AC_UY1000_.jpg"
            },
            {
                "item_id": "decor_wall_street",
                "name": "Wall St Desk Sign",
                "description": "Bring the NYSE vibe to your home setup.",
                "cost": 2000,
                "type": "decor",
                "image_url": "https://m.media-amazon.com/images/I/51WlO-3+QSL._AC_UF894,1000_QL80_.jpg"
            },
            {
                "item_id": "theme_dark_gold",
                "name": "Gold & Black Theme",
                "description": "Exclusive dashboard color scheme.",
                "cost": 500,
                "type": "cosmetic",
                "image_url": "https://m.media-amazon.com/images/I/41K+4rC6bCL._AC_UF1000,1000_QL80_.jpg"
            }
        ])
    
    # Initialize Assets
    if assets_col.count_documents({}) == 0:
        assets_col.insert_many([
            {"name":"TechNova Corp","ticker":"TNV","price":145,"change":0,"risk":"High","type":"Stocks"},
            {"name":"GreenEnergy Ltd","ticker":"GEL","price":89,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Apple Inc","ticker":"AAPL","price":180,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Tesla","ticker":"TSLA","price":250,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Nifty 50 ETF","ticker":"NIFTYETF","price":200,"change":0,"risk":"Medium","type":"ETFs"},
            {"name":"Gold ETF","ticker":"GOLDETF","price":60,"change":0,"risk":"Low","type":"ETFs"},
            {"name":"Bluechip Fund","ticker":"BCF","price":120,"change":0,"risk":"Medium","type":"Mutual Funds"},
            {"name":"FD 1 Year","ticker":"FD1","price":6.5,"change":0,"risk":"Low","type":"Fixed Deposits"},
        ])
    asyncio.create_task(price_engine())
    yield

# --- App Setup ---
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Websockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections: self.active_connections.remove(websocket)
    async def broadcast(self, data):
        for ws in self.active_connections:
            try: await ws.send_json(data)
            except: self.disconnect(ws)

manager = ConnectionManager()

@app.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await asyncio.sleep(10) 
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ====================================================================
#  DASHBOARD ENDPOINT (Constructs the exact JSON structure required)
# ====================================================================
@app.get("/dashboard")
def get_dashboard(clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    
    user = users_col.find_one({"clerk_id": clerk_id}, {"_id": 0})
    
    # 1. Calculate XP / Level Progress
    xp_needed = (user.get("level", 1) * 1000)
    progress_pct = (user.get("xp", 0) / xp_needed) * 100 if xp_needed > 0 else 0
    
    # 2. Construct Track Progress (Learning Modules)
    module_meta = {
        "budgeting": "Personal Budgeting",
        "investing": "Basics of Investing",
        "debt": "Debt Management"
    }
    
    user_modules = user.get("learning_progress", {})
    formatted_modules = []
    total_percentage = 0
    
    for mod_id, title in module_meta.items():
        # Get module data or default to empty
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

    # 3. Construct Leaderboard
    total_users = users_col.count_documents({})
    # Count how many users have MORE XP than current user, then add 1
    user_rank = users_col.count_documents({"xp": {"$gt": user.get("xp", 0)}}) + 1
    
    # Fetch top 3 users
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

    # 4. Construct Final Response
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

# ====================================================================
#  NEW ENDPOINT: Learning Progress Update
# ====================================================================
@app.post("/learning/update")
def update_learning_progress(data: LearningUpdate, clerk_id: str = Depends(get_current_user)):
    """
    Called by frontend when user finishes a game/module.
    """
    status = "completed" if data.percentage >= 100 else "in_progress"
    
    # Dynamic field names for MongoDB update
    update_query = {
        "$set": {
            f"learning_progress.{data.module_id}.percentage": data.percentage,
            f"learning_progress.{data.module_id}.status": status,
            # Update milestones if relevant
            "milestones.budget_simulator_used": True if data.module_id == "budgeting" and data.percentage > 0 else None
        },
        "$inc": {
            f"learning_progress.{data.module_id}.xp": data.xp_earned,
            "xp": data.xp_earned
        }
    }
    
    # Remove None values from $set
    update_query["$set"] = {k: v for k, v in update_query["$set"].items() if v is not None}

    users_col.update_one({"clerk_id": clerk_id}, update_query)
    update_user_activity(clerk_id)
    return {"message": "Progress updated"}

@app.get("/leaderboard")
def get_leaderboard():
    """Returns top 10 users by XP"""
    top_users = list(users_col.find(
        {}, 
        {"_id": 0, "clerk_id": 1, "xp": 1, "level": 1, "streak": 1}
    ).sort("xp", -1).limit(10))
    return top_users

@app.post("/quiz/submit")
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

@app.get("/portfolio")
def get_portfolio(clerk_id: str = Depends(get_current_user)):
    update_user_activity(clerk_id)
    return list(portfolio_col.find({"clerk_id": clerk_id}, {"_id":0}))

@app.get("/market")
def get_market():
    return list(assets_col.find({}, {"_id":0}))

@app.post("/trade/buy")
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

@app.post("/trade/sell")
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

@app.get("/store")
def get_store_items(clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    user_inventory = user.get("inventory", []) 
    
    items = list(store_col.find({}, {"_id": 0}))
    
    for item in items:
        item["owned"] = item["item_id"] in user_inventory
        
    return items

@app.post("/store/redeem")
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

@app.get("/inventory")
def get_user_inventory(clerk_id: str = Depends(get_current_user)):
    user = users_col.find_one({"clerk_id": clerk_id})
    inventory_ids = user.get("inventory", [])
    
    items = list(store_col.find({"item_id": {"$in": inventory_ids}}, {"_id": 0}))
    return items