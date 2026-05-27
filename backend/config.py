import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI missing")

client = MongoClient(MONGO_URI)
db = client["preppilot_ai"]

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")