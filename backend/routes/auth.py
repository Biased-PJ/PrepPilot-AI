from flask import Blueprint, request, jsonify

from middleware.auth_middleware import (
    token_required
)

from middleware.rate_limit_middleware import (
    rate_limit
)

from services.auth_service import (

    create_user,

    login_user,

    get_user_profile,

    update_password
)

# =========================================================
# BLUEPRINT
# =========================================================

auth = Blueprint(

    "auth",

    __name__
)

# =========================================================
# SIGNUP
# =========================================================

@auth.route("/signup", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def signup():

    data = request.json or {}

    result = create_user(data)

    status_code = 201 if result.get(
        "success"
    ) else 400

    return jsonify(result), status_code

# =========================================================
# LOGIN
# =========================================================

@auth.route("/login", methods=["POST"])
@rate_limit(max_requests=15, window_seconds=60)
def login():

    data = request.json or {}

    result = login_user(data)

    status_code = 200 if result.get(
        "success"
    ) else 401

    return jsonify(result), status_code

# =========================================================
# GET PROFILE
# =========================================================

@auth.route("/profile", methods=["GET"])
@token_required
def profile():

    user_email = request.user["email"]

    result = get_user_profile(
        user_email
    )

    status_code = 200 if result.get(
        "success"
    ) else 404

    return jsonify(result), status_code

# =========================================================
# UPDATE PASSWORD
# =========================================================

@auth.route(
    "/update-password",
    methods=["PUT"]
)
@token_required
@rate_limit(max_requests=5, window_seconds=60)
def change_password():

    data = request.json or {}

    old_password = data.get(
        "old_password"
    )

    new_password = data.get(
        "new_password"
    )

    if not old_password or not new_password:

        return jsonify({

            "success": False,

            "message":
                "old_password and new_password required"

        }), 400

    result = update_password(

        request.user["email"],

        old_password,

        new_password
    )

    status_code = 200 if result.get(
        "success"
    ) else 400

    return jsonify(result), status_code

# =========================================================
# VERIFY TOKEN
# =========================================================

@auth.route("/verify-token", methods=["GET"])
@token_required
def verify_token():

    return jsonify({

        "success": True,

        "message":
            "Token valid",

        "user": request.user
    }), 200