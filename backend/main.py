
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
from contextlib import asynccontextmanager

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

client = MongoClient(MONGO_URI)
db = client["finquest"]
users_col = db["users"]
assets_col = db["assets"]
portfolio_col = db["portfolio"]

class TradeRequest(BaseModel):
    ticker: str
    qty: int

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

def ensure_user(clerk_id: str):
    user = users_col.find_one({"clerk_id": clerk_id})
    if not user:
        users_col.insert_one({
            "clerk_id": clerk_id,
            "balance": 100000,
            "level": 1,
            "xp": 0
        })

async def price_engine():
    while True:
        assets = list(assets_col.find())
        for asset in assets:
            # Skip Fixed Deposits (Interest rates shouldn't fluctuate randomly)
            if asset["type"] == "Fixed Deposits":
                continue

            if asset["type"] == "Stocks":
                vol = 0.06 if asset["risk"] == "High" else 0.03 if asset["risk"] == "Medium" else 0.01
                change = random.uniform(-vol, vol)

            elif asset["type"] == "ETFs":
                vol = 0.02 if asset["risk"] == "High" else 0.01 if asset["risk"] == "Medium" else 0.005
                change = random.uniform(-vol, vol)

            elif asset["type"] == "Mutual Funds":
                vol = 0.005 if asset["risk"] == "High" else 0.003 if asset["risk"] == "Medium" else 0.001
                change = random.uniform(-vol, vol)
            
            else:
                change = 0

            new_price = round(asset["price"] + asset["price"] * change, 2)
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
    # --- FIX 2: Set realistic initial Interest Rates for FDs (e.g., 6.5 instead of 100) ---
    if assets_col.count_documents({}) == 0:
        assets_col.insert_many([
            # ===== STOCKS =====
            {"name":"TechNova Corp","ticker":"TNV","price":145,"change":0,"risk":"High","type":"Stocks"},
            {"name":"GreenEnergy Ltd","ticker":"GEL","price":89,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Apple Inc","ticker":"AAPL","price":180,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Tesla","ticker":"TSLA","price":250,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Amazon","ticker":"AMZN","price":155,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Google","ticker":"GOOGL","price":140,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Microsoft","ticker":"MSFT","price":330,"change":0,"risk":"Low","type":"Stocks"},
            {"name":"Meta","ticker":"META","price":380,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Netflix","ticker":"NFLX","price":420,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Reliance Industries","ticker":"RELIANCE","price":2950,"change":0,"risk":"Medium","type":"Stocks"},
            {"name":"Tata Motors","ticker":"TATAMOTORS","price":950,"change":0,"risk":"High","type":"Stocks"},
            {"name":"Infosys","ticker":"INFY","price":1450,"change":0,"risk":"Low","type":"Stocks"},
            {"name":"HDFC Bank","ticker":"HDFCBANK","price":1650,"change":0,"risk":"Low","type":"Stocks"},

            # ===== ETFs =====
            {"name":"Nifty 50 ETF","ticker":"NIFTYETF","price":200,"change":0,"risk":"Medium","type":"ETFs"},
            {"name":"Bank Nifty ETF","ticker":"BANKETF","price":180,"change":0,"risk":"Medium","type":"ETFs"},
            {"name":"S&P 500 ETF","ticker":"SPY","price":450,"change":0,"risk":"Low","type":"ETFs"},
            {"name":"Nasdaq 100 ETF","ticker":"QQQ","price":380,"change":0,"risk":"Medium","type":"ETFs"},
            {"name":"Gold ETF","ticker":"GOLDETF","price":60,"change":0,"risk":"Low","type":"ETFs"},
            {"name":"Silver ETF","ticker":"SILVERETF","price":75,"change":0,"risk":"Medium","type":"ETFs"},
            {"name":"Energy ETF","ticker":"ENERGYETF","price":120,"change":0,"risk":"High","type":"ETFs"},

            # ===== MUTUAL FUNDS =====
            {"name":"Bluechip Equity Fund","ticker":"BCF","price":120,"change":0,"risk":"Medium","type":"Mutual Funds"},
            {"name":"Midcap Growth Fund","ticker":"MGF","price":95,"change":0,"risk":"High","type":"Mutual Funds"},
            {"name":"Balanced Advantage Fund","ticker":"BAF","price":110,"change":0,"risk":"Low","type":"Mutual Funds"},
            {"name":"Smallcap Opportunity Fund","ticker":"SOF","price":80,"change":0,"risk":"High","type":"Mutual Funds"},
            {"name":"Index Fund Nifty","ticker":"NIFTYMF","price":150,"change":0,"risk":"Low","type":"Mutual Funds"},
            {"name":"Debt Income Fund","ticker":"DIF","price":105,"change":0,"risk":"Low","type":"Mutual Funds"},
            
            # ... Fixed Deposits (Price here = Interest Rate %) ...
            {"name":"FD 1 Year","ticker":"FD1","price":6.5,"change":0,"risk":"Low","type":"Fixed Deposits"},
            {"name":"FD 3 Year","ticker":"FD3","price":7.2,"change":0,"risk":"Low","type":"Fixed Deposits"},
            {"name":"FD 5 Year","ticker":"FD5","price":7.8,"change":0,"risk":"Low","type":"Fixed Deposits"},
            {"name":"Senior Citizen FD","ticker":"SCFD","price":8.5,"change":0,"risk":"Low","type":"Fixed Deposits"},
        ])

    asyncio.create_task(price_engine())
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data):
        for ws in self.active_connections.copy():
            try:
                await ws.send_json(data)
            except:
                self.disconnect(ws)

manager = ConnectionManager()

@app.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

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
    user = users_col.find_one({"clerk_id": clerk_id})
    
    if asset["type"] == "Fixed Deposits":
        cost = data.qty
    else:
        cost = asset["price"] * data.qty

    if user["balance"] < cost:
        return {"error": "Insufficient funds"}
    
    users_col.update_one({"clerk_id": clerk_id},{"$inc": {"balance": -cost}})
    
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
    
    if not holding or holding["quantity"] < data.qty:
        return {"error": "Not enough quantity"}
    
    if asset["type"] == "Fixed Deposits":
        revenue = data.qty 
    else:
        revenue = asset["price"] * data.qty

    users_col.update_one({"clerk_id": clerk_id},{"$inc": {"balance": revenue}})
    
    if holding["quantity"] == data.qty:
        portfolio_col.delete_one({"_id": holding["_id"]})
    else:
        portfolio_col.update_one({"_id": holding["_id"]},{"$inc": {"quantity": -data.qty}})
    
    return {"message": "Sold"}