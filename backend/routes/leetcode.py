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

from services.unified_profile import serialize_profile

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
@token_required  #  Added auth protection guard
def get_leetcode_stats():
    #  Correctly extract email from the verified token dict
    user_email = request.user["email"]

    # Check if a verification process was started or completed
    verification = db.leetcode_verification.find_one({
        "user_email": user_email,
        "platform": "leetcode"
    })

    if not verification:
        return jsonify({"success": False, "verified": False}), 200

    # Fetch profile stats from the sync snapshot collection
    saved_profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": "leetcode"
    })

    return jsonify({
        "success": True,
        "verified": verification.get("verified", False),
        "username": verification.get("username", ""),
        "verification_code": f"PrepPilot-VERIFY-{verification.get('code')}" if not verification.get("verified") else "",
        "profile": serialize_profile(saved_profile) if saved_profile else None
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