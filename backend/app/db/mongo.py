from pymongo import MongoClient
import gridfs
import os
import certifi  # ← Add this
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Use certifi to fix SSL handshake issues with MongoDB Atlas
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client[DB_NAME]

# Collections
dataset_collection = db["datasets"]  # Single collection for all info

# GridFS
fs = gridfs.GridFS(db)
