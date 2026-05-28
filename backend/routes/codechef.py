from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.codechef_service import (

    start_verification,

    verify_account,

    sync_profile,

    get_saved_profile,

    remove_account
)

# =========================================================
# BLUEPRINT
# =========================================================

codechef = Blueprint(
    "codechef",
    __name__
)

# =========================================================
# START VERIFICATION
# =========================================================

@codechef.route(
    "/codechef/start-verification",
    methods=["POST"]
)
@token_required
def start_codechef_verification():

    user_email = request.user["email"]

    data = request.json

    username = data.get("username")

    result = start_verification(

        user_email,
        username
    )

    status = (
        200
        if result["success"]
        else 400
    )

    return jsonify(result), status

# =========================================================
# VERIFY ACCOUNT
# =========================================================

@codechef.route(
    "/codechef/verify",
    methods=["POST"]
)
@token_required
def verify_codechef():

    user_email = request.user["email"]

    result = verify_account(
        user_email
    )

    status = (
        200
        if result["success"]
        else 400
    )

    return jsonify(result), status

# =========================================================
# SYNC PROFILE
# =========================================================

@codechef.route(
    "/codechef/sync",
    methods=["POST"]
)
@token_required
def sync_codechef():

    user_email = request.user["email"]

    result = sync_profile(
        user_email
    )

    status = (
        200
        if result["success"]
        else 400
    )

    return jsonify(result), status

# =========================================================
# GET PROFILE
# =========================================================

@codechef.route(
    "/codechef/profile",
    methods=["GET"]
)
@token_required
def get_profile():

    user_email = request.user["email"]

    result = get_saved_profile(
        user_email
    )

    status = (
        200
        if result["success"]
        else 404
    )

    return jsonify(result), status

# =========================================================
# REMOVE ACCOUNT
# =========================================================

@codechef.route(
    "/codechef/remove",
    methods=["DELETE"]
)
@token_required
def remove_codechef():

    user_email = request.user["email"]

    result = remove_account(
        user_email
    )

    return jsonify(result), 200

# =========================================================
# HEALTH CHECK
# =========================================================

@codechef.route(
    "/codechef/test",
    methods=["GET"]
)
def codechef_test():

    return jsonify({

        "success": True,

        "message":
            "CodeChef routes working"

    }), 200