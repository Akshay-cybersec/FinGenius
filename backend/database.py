import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["finquest"]
users_col = db["users"]
assets_col = db["assets"]
portfolio_col = db["portfolio"]
store_col = db["store_items"]