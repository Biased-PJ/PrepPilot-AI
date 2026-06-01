from flask import Blueprint, request, jsonify

from config import db

from middleware.auth_middleware import token_required

from services.leetcode_service import (
    start_verification,
    verify_account,
    sync_profile,
    get_saved_profile,
    remove_account,
)

leetcode = Blueprint("leetcode", __name__)


# --- GLOBAL OPTIONS BYPASS FOR CORS PREFLIGHTS ---
@leetcode.before_request
def handle_options_preflight():
    """Intersects browser CORS safety checks before token middleware can block them."""
    if request.method == "OPTIONS":
        return "", 200


def _username_from_body(data):
    return data.get("username") or data.get("handle")


# Explicitly add 'OPTIONS' to your routing methods arrays
@leetcode.route("/connect", methods=["POST", "OPTIONS"])
@token_required
def connect():
    data = request.json or {}
    username = _username_from_body(data)
    result = start_verification(request.user["email"], username)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@leetcode.route("/disconnect", methods=["POST", "OPTIONS"])
@token_required
def disconnect():
    result = remove_account(request.user["email"])
    return jsonify(result), 200


@leetcode.route("/stats", methods=["GET"])
def get_leetcode_stats():
    # 1. Fetch user identification details from your JWT auth decorator payload
    user_email = request.user_email  # Replace with your actual current_user decorator pattern

    # 2. Check if a verified link token exists in the database
    verification = db.leetcode_verification.find_one({
        "user_email": user_email,
        "platform": "leetcode"
    })

    if not verification:
        return jsonify({"success": False, "verified": False}), 200

    # 3. Pull historical profile entries if sync steps completed previously
    saved_profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": "leetcode"
    })

    return jsonify({
        "success": True,
        "verified": verification.get("verified", False),
        "username": verification.get("username", ""),
        "verification_code": f"PrepPilot-VERIFY-{verification.get('code')}" if not verification.get("verified") else "",
        "data": saved_profile.get("stats") if saved_profile else None
    }), 200


@leetcode.route("/verify", methods=["POST", "OPTIONS"])
@token_required
def verify():
    result = verify_account(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@leetcode.route("/sync", methods=["POST", "OPTIONS"])
@token_required
def sync():
    result = sync_profile(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@leetcode.route("/test", methods=["GET"])
def leetcode_test():
    return jsonify({
        "success": True,
        "message": "LeetCode routes working",
    }), 200