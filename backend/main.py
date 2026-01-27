import os
import random
import asyncio
import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from jose import jwt
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

client = MongoClient(MONGO_URI)
db = client["finquest"]
users_col = db["users"]
assets_col = db["assets"]
portfolio_col = db["portfolio"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
jwks = requests.get(f"{CLERK_ISSUER}/.well-known/jwks.json").json()

class TradeRequest(BaseModel):
    ticker: str
    qty: int

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

def ensure_user(clerk_id: str):
    user = users_col.find_one({"clerk_id": clerk_id})
    if not user:
        users_col.insert_one({
            "clerk_id": clerk_id,
            "balance": 100000,
            "level": 1,
            "xp": 0
        })

@app.on_event("startup")
def seed_assets():
    if assets_col.count_documents({}) == 0:
        assets_col.insert_many([
            {"name":"TechNova Corp","ticker":"TNV","price":145,"change":0,"risk":"High","type":"Stocks"},
            {"name":"GreenEnergy Ltd","ticker":"GEL","price":89,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"SafeHaven Gold","ticker":"SHG","price":540,"change":0,"risk":"Low","type":"ETFs"},
            {"name":"Global Bond Fund","ticker":"GBF","price":102,"change":0,"risk":"Low","type":"Mutual Funds"},
            {"name":"FD 1 Year","ticker":"FD1","price":100,"change":0,"risk":"Low","type":"Fixed Deposits"},
            {"name":"Apple Inc","ticker":"AAPL","price":180,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Tesla","ticker":"TSLA","price":250,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Nifty ETF","ticker":"NIFTY","price":200,"change":0,"risk":"Medium","type":"ETFs"},
        ])

@app.get("/market")
def get_market():
    return list(assets_col.find({}, {"_id":0}))

@app.get("/user")
def get_user(clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)
    return users_col.find_one({"clerk_id": clerk_id}, {"_id":0})

@app.get("/portfolio")
def get_portfolio(clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)
    return list(portfolio_col.find({"clerk_id": clerk_id}, {"_id":0}))

@app.post("/trade/buy")
def buy_asset(data: TradeRequest, clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)

    asset = assets_col.find_one({"ticker": data.ticker})
    if not asset:
        return {"error": "Asset not found"}

    user = users_col.find_one({"clerk_id": clerk_id})
    cost = asset["price"] * data.qty

    if user["balance"] < cost:
        return {"error": "Insufficient funds"}

    users_col.update_one(
        {"clerk_id": clerk_id},
        {"$inc": {"balance": -cost}}
    )

    portfolio_col.update_one(
        {"clerk_id": clerk_id, "ticker": data.ticker},
        {"$inc": {"quantity": data.qty}, "$setOnInsert": {"buy_price": asset["price"]}},
        upsert=True
    )

    return {"message": "Bought"}

@app.post("/trade/sell")
def sell_asset(data: TradeRequest, clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)

    holding = portfolio_col.find_one({"clerk_id": clerk_id, "ticker": data.ticker})
    asset = assets_col.find_one({"ticker": data.ticker})

    if not asset:
        return {"error": "Asset not found"}

    if not holding or holding["quantity"] < data.qty:
        return {"error": "Not enough quantity"}

    revenue = asset["price"] * data.qty

    users_col.update_one(
        {"clerk_id": clerk_id},
        {"$inc": {"balance": revenue}}
    )

    if holding["quantity"] == data.qty:
        portfolio_col.delete_one({"_id": holding["_id"]})
    else:
        portfolio_col.update_one(
            {"_id": holding["_id"]},
            {"$inc": {"quantity": -data.qty}}
        )

    return {"message": "Sold"}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data):
        for ws in self.active_connections:
            await ws.send_json(data)

manager = ConnectionManager()

@app.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def price_engine():
    while True:
        assets = list(assets_col.find())
        for asset in assets:
            if asset["type"] == "Fixed Deposits":
                change = 0.0001
            else:
                vol = 0.05 if asset["risk"]=="High" else 0.02 if asset["risk"]=="Medium" else 0.005
                change = random.uniform(-vol, vol)

            new_price = round(asset["price"] + asset["price"] * change, 2)
            change_pct = round(change * 100, 2)

            assets_col.update_one(
                {"_id": asset["_id"]},
                {"$set": {"price": new_price, "change": change_pct}}
            )

        updated_assets = list(assets_col.find({}, {"_id":0}))
        await manager.broadcast(updated_assets)

        await asyncio.sleep(5)

@app.on_event("startup")
async def start_engine():
    asyncio.create_task(price_engine())
