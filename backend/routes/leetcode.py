from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.leetcode_service import (
    start_verification,
    verify_account,
    sync_profile,
    get_saved_profile,
    remove_account,
)

leetcode = Blueprint("leetcode", __name__)


def _username_from_body(data):
    return data.get("username") or data.get("handle")


@leetcode.route("/connect", methods=["POST"])
@token_required
def connect():
    data = request.json or {}
    username = _username_from_body(data)
    result = start_verification(request.user["email"], username)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@leetcode.route("/disconnect", methods=["POST"])
@token_required
def disconnect():
    result = remove_account(request.user["email"])
    return jsonify(result), 200


@leetcode.route("/stats", methods=["GET"])
@token_required
def stats():
    result = get_saved_profile(request.user["email"])
    status = 200 if result.get("success") else 404
    return jsonify(result), status


@leetcode.route("/verify", methods=["POST"])
@token_required
def verify():
    result = verify_account(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@leetcode.route("/sync", methods=["POST"])
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
