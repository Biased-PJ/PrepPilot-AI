from datetime import datetime
from config import db, redis_client  # Ensure redis_client is imported
import json
from utils.password_helper import hash_password, verify_password
from utils.jwt_helper import generate_token
from utils.validators import validate_email, validate_password, validate_required_fields

# =========================================================
# CREATE USER
# =========================================================
def create_user(data):
    required_fields = ["name", "email", "password"]
    missing = validate_required_fields(data, required_fields)
    if missing:
        return {"success": False, "message": f"Missing: {', '.join(missing)}"}

    name, email, password = data["name"].strip(), data["email"].strip().lower(), data["password"]

    if not validate_email(email) or not validate_password(password):
        return {"success": False, "message": "Invalid email or weak password"}

    # Use projection: only check for existence of email
    if db.users.find_one({"email": email}, {"_id": 1}):
        return {"success": False, "message": "User already exists"}

    user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": "user",
        "created_at": datetime.utcnow()
    }
    result = db.users.insert_one(user)
    
    return {
        "success": True,
        "message": "User created",
        "user": {"id": str(result.inserted_id), "name": name, "email": email},
        "token": generate_token(email)
    }

# =========================================================
# LOGIN USER (OPTIMIZED & SERIALIZATION-SAFE)
# =========================================================
def login_user(data):
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    # Fetch ONLY necessary fields for verification
    user = db.users.find_one(
        {"email": email}, 
        {"password": 1, "name": 1, "role": 1}
    )

    if not user or not verify_password(password, user["password"]):
        return {"success": False, "message": "Invalid email or password"}

    token = generate_token(email)
    
    # CRITICAL: Strip out the raw ObjectId right away by converting it to a string
    user_data = {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": email,
        "role": user.get("role", "user")
    }
    
    # Cache the safely stringified user_data dictionary
    try:
        redis_client.setex(f"user:{email}", 3600, json.dumps(user_data))
    except Exception as redis_err:
        # Fallback gracefully if Redis has writing issues so your user can still log in!
        print(f"Redis caching failed during login: {redis_err}")

    return {"success": True, "token": token, "user": user_data}

# =========================================================
# GET USER PROFILE (Cached via Middleware, but fallback included)
# =========================================================
def get_user_profile(user_email):
    user = db.users.find_one({"email": user_email}, {"password": 0})
    if not user:
        return {"success": False, "message": "User not found"}

    return {
        "success": True,
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role", "user"),
            "created_at": user.get("created_at")
        }
    }

# =========================================================
# UPDATE PASSWORD
# =========================================================
def update_password(user_email, old_password, new_password):
    user = db.users.find_one({"email": user_email}, {"password": 1})
    if not user or not verify_password(old_password, user["password"]):
        return {"success": False, "message": "Invalid credentials"}

    if not validate_password(new_password):
        return {"success": False, "message": "New password too weak"}

    db.users.update_one(
        {"email": user_email},
        {"$set": {"password": hash_password(new_password), "updated_at": datetime.utcnow()}}
    )
    redis_client.delete(f"user:{user_email}")
    return {"success": True, "message": "Password updated"}

# =========================================================
# UPDATE USER PROFILE
# =========================================================
def update_user_profile(user_email, data):
    name = data.get("name")
    if not name or not name.strip():
        return {"success": False, "message": "Name cannot be empty"}

    db.users.update_one({"email": user_email}, {"$set": {"name": name.strip(), "updated_at": datetime.utcnow()}})
    
    # Invalidate/Update cache
    redis_client.delete(f"user:{user_email}")
    
    return get_user_profile(user_email)

# =========================================================
# REQUEST PASSWORD RESET
# =========================================================
def request_password_reset(email):
    # Only check if user exists, don't leak account existence via timing
    user = db.users.find_one({"email": email.strip().lower()}, {"_id": 1})
    return {"success": True, "message": "If email exists, instructions were sent."}