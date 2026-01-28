import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <--- CRITICAL IMPORT
from contextlib import asynccontextmanager
from database import store_col, assets_col
from services import price_engine
from routers import dashboard, market, trade, store, learning,user

@asynccontextmanager
async def lifespan(app: FastAPI):
    BASE_URL = "http://localhost:8000/static/store"

    if store_col.count_documents({}) == 0:
        store_col.insert_many([
            {
                "item_id": "merch_shirt_black",
                "name": "Black Trader Tee",
                "description": "Stealth mode for late night trading sessions.",
                "cost": 1200,
                "type": "merch",
                "image_url": f"{BASE_URL}/black_t.jpg"
            },
            {
                "item_id": "merch_shirt_white",
                "name": "White Bull Tee",
                "description": "Clean look for the disciplined investor.",
                "cost": 1200,
                "type": "merch",
                "image_url": f"{BASE_URL}/white_t.jpg"
            },
            {
                "item_id": "merch_hoodie",
                "name": "Market Maker Hoodie",
                "description": "Stay warm when the market freezes.",
                "cost": 2500,
                "type": "merch",
                "image_url": f"{BASE_URL}/hoodie.jpg"
            },
            {
                "item_id": "merch_cap",
                "name": "Trader Cap",
                "description": "Keep the sun out of your eyes while checking charts.",
                "cost": 800,
                "type": "merch",
                "image_url": f"{BASE_URL}/cap.jpg"
            },
            {
                "item_id": "merch_bag",
                "name": "Secure Backpack",
                "description": "Carry your gains in style.",
                "cost": 1500,
                "type": "merch",
                "image_url": f"{BASE_URL}/bag.jpg"
            },
            {
                "item_id": "merch_bottle",
                "name": "Hydration Flask",
                "description": "Stay hydrated. The market is salty enough.",
                "cost": 500,
                "type": "merch",
                "image_url": f"{BASE_URL}/bottle.jpg"
            },
            {
                "item_id": "merch_mousepad",
                "name": "Pro Desk Mat",
                "description": "Smooth surface for high-frequency trading execution.",
                "cost": 700,
                "type": "decor",
                "image_url": f"{BASE_URL}/mouse.jpg"
            }
        ])
    
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

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(market.router)
app.include_router(trade.router)
app.include_router(store.router)
app.include_router(learning.router)
app.include_router(user.router) 