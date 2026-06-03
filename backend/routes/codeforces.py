from flask import Blueprint, request, jsonify

# IMPORT DB SO YOUR STATS ROUTE DOESN'T CRASH
from config import db 
from middleware.auth_middleware import token_required
from services.codeforces_service import (
    start_verification,
    verify_account,
    sync_profile,
    get_saved_profile,
    remove_account,
)

codeforces = Blueprint("codeforces", __name__)


def _handle_from_body(data):
    return data.get("handle") or data.get("username")


# --- GLOBAL OPTIONS BYPASS FOR CORS PREFLIGHTS ---
@codeforces.before_request
def handle_options_preflight():
    """Intersects browser CORS safety checks before token middleware can block them."""
    if request.method == "OPTIONS":
        return "", 200


# Explicitly add 'OPTIONS' to match your LeetCode routing style
@codeforces.route("/connect", methods=["POST", "OPTIONS"])
@token_required
def connect():
    data = request.json or {}
    handle = _handle_from_body(data)
    result = start_verification(request.user["email"], handle)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/disconnect", methods=["POST", "OPTIONS"])
@token_required
def disconnect():
    result = remove_account(request.user["email"])
    return jsonify(result), 200


@codeforces.route("/verify", methods=["POST", "OPTIONS"])
@token_required
def verify():
    result = verify_account(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/sync", methods=["POST", "OPTIONS"])
@token_required
def sync():
    result = sync_profile(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/stats", methods=["GET"])
@token_required
def stats():
    user_email = request.user["email"]

    # Check if a verification process was started or completed
    verification = db.codeforces_verification.find_one({
        "user_email": user_email
    })

    if not verification:
        return jsonify({"success": False, "verified": False}), 200

    # Fetch profile stats from the sync snapshot collection
    saved_profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": "codeforces"
    })

    # Safely convert MongoDB ObjectIds if necessary
    if saved_profile and "_id" in saved_profile:
        saved_profile["_id"] = str(saved_profile["_id"])

    return jsonify({
        "success": True,
        "verified": verification.get("verified", False),
        "username": verification.get("handle", ""),
        "verification_code": verification.get("verification_text", "") if not verification.get("verified") else "",
        "profile": saved_profile if saved_profile else None
    }), 200