from functools import wraps
from flask import request, jsonify, current_app
import jwt

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        token = None

        # Get Authorization header
        auth_header = request.headers.get('Authorization')

        if auth_header:

            try:
                # Format: Bearer <token>
                token = auth_header.split(" ")[1]

            except:
                return jsonify({
                    "error": "Invalid token format"
                }), 401

        if not token:
            return jsonify({
                "error": "Token is missing"
            }), 401

        try:

            data = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=["HS256"]
            )

            request.user = data

        except jwt.ExpiredSignatureError:
            return jsonify({
                "error": "Token expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "error": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated