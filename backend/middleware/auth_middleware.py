from functools import wraps
from flask import request, jsonify
import json  
from config import db, redis_client
from bson import ObjectId  # <-- ADD THIS IMPORT

# IMPORTS
from utils.jwt_helper import extract_token, decode_token 

def token_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        # 1. Allow CORS Preflight (OPTIONS) requests to bypass token validation
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

        # 2. TRY CACHE FIRST
        cached_user = redis_client.get(f"user:{email}")
        if cached_user:
            user_data = json.loads(cached_user)
            # CRITICAL FIX: Convert the string ID back to a native MongoDB ObjectId
            user_data["_id"] = ObjectId(user_data["_id"])
            request.user = user_data
        else:
            # 3. Fetch the FULL user object to ensure no downstream routes break
            user = db.users.find_one({"email": email})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Assign the native object to the request for immediate use in this request cycle
            request.user = user
            
            # Create a copy to modify just for Redis serialization
            redis_user_copy = user.copy()
            redis_user_copy["_id"] = str(redis_user_copy["_id"])
            
            # Cache the string-serializable copy for 1 hour
            redis_client.setex(f"user:{email}", 3600, json.dumps(redis_user_copy))

        return route_function(*args, **kwargs)
    return wrapper