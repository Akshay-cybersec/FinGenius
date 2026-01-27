from fastapi import FastAPI
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from auth import get_current_user
from fastapi import Depends


load_dotenv()

app = FastAPI()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["finquest"]

users_col = db["users"]
assets_col = db["assets"]
portfolio_col = db["portfolio"]

def ensure_user(clerk_id: str):
    user = users_col.find_one({"clerk_id": clerk_id})
    if not user:
        users_col.insert_one({
            "clerk_id": clerk_id,
            "balance": 100000,
            "xp": 0,
            "level": 1
        })

@app.on_event("startup")
def seed_assets():
    if assets_col.count_documents({}) == 0:
        assets_col.insert_many([
            {"name":"TechNova Corp","ticker":"TNV","price":145,"risk":"High","type":"Stocks"},
            {"name":"GreenEnergy Ltd","ticker":"GEL","price":89,"risk":"Medium","type":"Stocks"},
            {"name":"SafeHaven Gold","ticker":"SHG","price":540,"risk":"Low","type":"ETFs"},
            {"name":"Global Bond Fund","ticker":"GBF","price":102,"risk":"Low","type":"Mutual Funds"}
        ])


@app.get("/market")
def get_market():
    return list(assets_col.find({}, {"_id":0}))

@app.post("/trade/buy")
def buy_asset(ticker: str, qty: int, clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)

    user = users_col.find_one({"clerk_id": clerk_id})
    asset = assets_col.find_one({"ticker": ticker})

    cost = asset["price"] * qty

    if user["balance"] < cost:
        return {"error": "Not enough virtual money"}

    users_col.update_one(
        {"clerk_id": clerk_id},
        {"$inc": {"balance": -cost}}
    )

    portfolio_col.update_one(
        {"clerk_id": clerk_id, "ticker": ticker},
        {"$inc": {"quantity": qty}, "$setOnInsert": {"buy_price": asset["price"]}},
        upsert=True
    )

    return {"message": "Bought successfully"}


@app.get("/portfolio")
def get_portfolio(clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)
    return list(portfolio_col.find({"clerk_id": clerk_id}, {"_id":0}))

@app.get("/user")
def get_user(clerk_id: str = Depends(get_current_user)):
    ensure_user(clerk_id)
    return users_col.find_one({"clerk_id": clerk_id}, {"_id":0})


import random

@app.post("/market/update")
def update_market():
    for asset in assets_col.find():
        vol = 0.05 if asset["risk"]=="High" else 0.02 if asset["risk"]=="Medium" else 0.005
        change = random.uniform(-vol, vol)
        new_price = round(asset["price"] + asset["price"] * change, 2)

        assets_col.update_one(
            {"_id": asset["_id"]},
            {"$set": {"price": new_price}}
        )
    return {"status":"updated"}
