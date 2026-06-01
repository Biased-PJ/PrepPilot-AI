from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required
from middleware.rate_limit_middleware import rate_limit

from services.auth_service import (
    create_user,
    login_user,
    get_user_profile,
    update_user_profile,
    update_password,
    request_password_reset,
)

auth = Blueprint("auth", __name__)


@auth.route("/signup", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def signup():
    data = request.json or {}
    result = create_user(data)
    status_code = 201 if result.get("success") else 400
    return jsonify(result), status_code


@auth.route("/login", methods=["POST"])
@rate_limit(max_requests=15, window_seconds=60)
def login():
    data = request.json or {}
    result = login_user(data)
    status_code = 200 if result.get("success") else 401
    return jsonify(result), status_code


@auth.route("/logout", methods=["POST"])
def logout():
    return jsonify({
        "success": True,
        "message": "Logged out successfully",
    }), 200


@auth.route("/reset-password", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def reset_password():
    data = request.json or {}
    email = data.get("email")
    result = request_password_reset(email)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@auth.route("/profile", methods=["GET"])
@token_required
def get_profile():
    result = get_user_profile(request.user["email"])
    status_code = 200 if result.get("success") else 404
    return jsonify(result), status_code


@auth.route("/profile", methods=["PUT"])
@token_required
@rate_limit(max_requests=10, window_seconds=60)
def put_profile():
    data = request.json or {}
    result = update_user_profile(request.user["email"], data)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@auth.route("/profile/streak", methods=["GET"])
@token_required
def profile_streak():
    from services.streak_service import get_streak

    result = get_streak(request.user["email"])
    return jsonify({
        "success": True,
        "streak": result,
    }), 200


@auth.route("/update-password", methods=["PUT"])
@token_required
@rate_limit(max_requests=5, window_seconds=60)
def change_password():
    data = request.json or {}
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({
            "success": False,
            "message": "old_password and new_password required",
        }), 400

    result = update_password(
        request.user["email"],
        old_password,
        new_password,
    )
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@auth.route("/verify-token", methods=["GET"])
@token_required
def verify_token():
    return jsonify({
        "success": True,
        "message": "Token valid",
        "user": request.user,
    }), 200
