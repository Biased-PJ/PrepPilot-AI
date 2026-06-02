from functools import wraps
from flask import request, jsonify
import json  
from config import db, redis_client

# IMPORTS
from utils.jwt_helper import extract_token, decode_token 

def token_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        # 1. FIX: Allow CORS Preflight (OPTIONS) requests to bypass token validation
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
            request.user = json.loads(cached_user)
        else:
            # Fetch the ENTIRE user object to ensure no downstream routes break
            user = db.users.find_one({"email": email})
            
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Convert ObjectId to string so it is JSON serializable for Redis
            user["_id"] = str(user["_id"])
            
            # Assign the full user object to the request
            request.user = user
            
            # Cache the full object for 1 hour
            redis_client.setex(f"user:{email}", 3600, json.dumps(request.user))

        return route_function(*args, **kwargs)
    return wrapper