import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not MONGO_URI:
    raise Exception("MONGO_URI not found")

client = MongoClient(MONGO_URI)
db = client["preppilot_ai"]