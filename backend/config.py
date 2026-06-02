import os
import redis  # 1. ADDED REDIS IMPORT
from dotenv import load_dotenv
from pymongo import MongoClient

# =========================================================
# LOAD ENV VARIABLES
# =========================================================
load_dotenv()

# =========================================================
# ENV VARIABLES
# =========================================================
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "preppilot_jwt_secret")
DATABASE_NAME = os.getenv("DATABASE_NAME", "preppilot_ai")

# 2. REDIS ENV VARIABLES (Defaults to standard local Redis settings)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# =========================================================
# VALIDATE REQUIRED ENV VARIABLES
# =========================================================
if not MONGO_URI:
    raise Exception("MONGO_URI missing in .env")

# =========================================================
# MONGODB CONNECTION
# =========================================================
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# =========================================================
# REDIS CONNECTION POOL (CRITICAL FOR LIGHTNING SPEED)
# =========================================================
# A connection pool reuses open connections instead of creating new ones per request.
redis_pool = redis.ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True # Automatically converts bytes to Python strings
)
redis_client = redis.Redis(connection_pool=redis_pool)

# =========================================================
# TEST DATABASE CONNECTIONS
# =========================================================
try:
    client.admin.command("ping")
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB connection failed:", e)

try:
    redis_client.ping()
    print("Redis connected successfully")
except Exception as e:
    print("Redis connection failed! Make sure Redis server is running:", e)

# =========================================================
# APP CONFIG
# =========================================================
APP_NAME = "PrepPilot AI"
APP_VERSION = "1.0.0"
DEBUG_MODE = True