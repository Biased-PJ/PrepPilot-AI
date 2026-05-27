import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI not found in Render environment variables")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

db = client["preppilot_ai"]