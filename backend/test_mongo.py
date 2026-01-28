from pymongo import MongoClient
import certifi

uri = "mongodb+srv://akshayaaku1411_db_user:Q8zAar4nFIWapNu1@cluster0.a3neqgb.mongodb.net/?appName=Cluster0"

client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.test
print(db.list_collection_names())
