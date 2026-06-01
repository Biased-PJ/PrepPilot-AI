from functools import wraps

from flask import request, jsonify

from config import db

from utils.jwt_helper import (

    extract_token,

    decode_token
)

# =========================================================
# TOKEN REQUIRED DECORATOR
# =========================================================

def token_required(route_function):

    @wraps(route_function)
    def wrapper(*args, **kwargs):

        if request.method == 'OPTIONS':
            return route_function(*args, **kwargs)

        # =================================================
        # GET AUTH HEADER
        # =================================================

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:

            return jsonify({

                "success": False,

                "message":
                    "Authorization header missing"

            }), 401

        # =================================================
        # EXTRACT TOKEN
        # =================================================

        token = extract_token(auth_header)

        if not token:

            return jsonify({

                "success": False,

                "message":
                    "Invalid authorization format"

            }), 401

        # =================================================
        # DECODE TOKEN
        # =================================================

        decoded = decode_token(token)

        if not decoded["success"]:

            return jsonify({

                "success": False,

                "message":
                    decoded["message"]

            }), 401

        # =================================================
        # GET USER
        # =================================================

        payload = decoded["data"]

        user = db.users.find_one({

            "email":
                payload["email"]
        })

        if not user:

            return jsonify({

                "success": False,

                "message":
                    "User not found"

            }), 404

        # =================================================
        # ATTACH USER TO REQUEST
        # =================================================

        request.user = {

            "_id": str(user["_id"]),

            "name": user.get("name"),

            "email": user.get("email"),

            "role": user.get(
                "role",
                "user"
            )
        }

        # =================================================
        # EXECUTE ROUTE
        # =================================================

        return route_function(
            *args,
            **kwargs
        )

    return wrapper