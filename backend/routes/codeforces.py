from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.codeforces_service import (

    start_verification,

    verify_account,

    sync_profile,

    get_saved_profile,

    remove_account
)

# =========================================================
# BLUEPRINT
# =========================================================

codeforces = Blueprint(
    "codeforces",
    __name__
)

# =========================================================
# START VERIFICATION
# =========================================================

@codeforces.route(
    "/codeforces/start-verification",
    methods=["POST"]
)
@token_required
def start_codeforces_verification():

    user_email = request.user["email"]

    data = request.json

    handle = data.get("handle")

    result = start_verification(

        user_email,
        handle
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

@codeforces.route(
    "/codeforces/verify",
    methods=["POST"]
)
@token_required
def verify_codeforces():

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

@codeforces.route(
    "/codeforces/sync",
    methods=["POST"]
)
@token_required
def sync_codeforces():

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

@codeforces.route(
    "/codeforces/profile",
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

@codeforces.route(
    "/codeforces/remove",
    methods=["DELETE"]
)
@token_required
def remove_codeforces():

    user_email = request.user["email"]

    result = remove_account(
        user_email
    )

    return jsonify(result), 200

# =========================================================
# HEALTH CHECK
# =========================================================

@codeforces.route(
    "/codeforces/test",
    methods=["GET"]
)
def codeforces_test():

    return jsonify({

        "success": True,

        "message":
            "Codeforces routes working"

    }), 200