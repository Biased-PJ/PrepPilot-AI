import os

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

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "preppilot_jwt_secret"
)

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "preppilot_ai"
)

# =========================================================
# VALIDATE REQUIRED ENV VARIABLES
# =========================================================

if not MONGO_URI:

    raise Exception(
        "MONGO_URI missing in .env"
    )

# =========================================================
# MONGODB CONNECTION
# =========================================================

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

# =========================================================
# TEST DATABASE CONNECTION
# =========================================================

try:

    client.admin.command("ping")

    print(
        "MongoDB connected successfully"
    )

except Exception as e:

    print(
        "MongoDB connection failed:"
    )

    print(e)

# =========================================================
# APP CONFIG
# =========================================================

APP_NAME = "PrepPilot AI"

APP_VERSION = "1.0.0"

DEBUG_MODE = True