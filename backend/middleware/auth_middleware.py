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
            # 3. PROJECTION: Fetch needed fields. 
            # NOTE: If your dashboard/analytics services break because they need 
            # specific fields (like 'joined_teams', 'preferences', etc.), add them to this dictionary.
            user = db.users.find_one(
                {"email": email}, 
                {"name": 1, "email": 1, "role": 1}
            )
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Prepare user object
            request.user = {
                "_id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "user")
            }
            # Cache for 1 hour (3600 seconds)
            redis_client.setex(f"user:{email}", 3600, json.dumps(request.user))

        return route_function(*args, **kwargs)
    return wrapper