from functools import wraps
from flask import request, jsonify
import json  
from config import db, redis_client
from bson import ObjectId  
from redis.exceptions import ConnectionError, TimeoutError # <-- ADD THIS IMPORT

# IMPORTS
from utils.jwt_helper import extract_token, decode_token 

def token_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        # 1. Allow CORS Preflight (OPTIONS) requests
        if request.method == "OPTIONS":
            return route_function(*args, **kwargs)

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header missing"}), 401

        token = extract_token(auth_header)
        decoded = decode_token(token)
        if not decoded["success"]:
            return jsonify({"success": False, "message": decoded["message"]}), 401

        payload = decoded["data"]
        email = payload["email"]
        
        user_data = None

        # 2. TRY CACHE (Safe-guarded against Redis connection failures)
        try:
            cached_user = redis_client.get(f"user:{email}")
            if cached_user:
                user_data = json.loads(cached_user)
                user_data["_id"] = ObjectId(user_data["_id"])
                request.user = user_data
        except (ConnectionError, TimeoutError, Exception) as e:
            # Redis is down or refusing connections, print log and skip to MongoDB fallback
            print(f"Redis fallback triggered: {e}")
            user_data = None

        # 3. DATABASE FALLBACK (Runs if cache misses OR if Redis is broken)
        if not user_data:
            user = db.users.find_one({"email": email})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Set the native dict to request object immediately
            request.user = user
            
            # Safely attempt to update Redis cache for next time, without crashing if it fails
            try:
                redis_user_copy = user.copy()
                redis_user_copy["_id"] = str(redis_user_copy["_id"])
                redis_client.setex(f"user:{email}", 3600, json.dumps(redis_user_copy))
            except Exception:
                pass # Silently ignore Redis write errors so the user request succeeds

        return route_function(*args, **kwargs)
    return wrapper