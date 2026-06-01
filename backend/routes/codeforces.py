from flask import Blueprint, request, jsonify

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


@codeforces.route("/connect", methods=["POST"])
@token_required
def connect():
    data = request.json or {}
    handle = _handle_from_body(data)
    result = start_verification(request.user["email"], handle)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/disconnect", methods=["POST"])
@token_required
def disconnect():
    result = remove_account(request.user["email"])
    return jsonify(result), 200


@codeforces.route("/stats", methods=["GET"])
@token_required
def stats():
    result = get_saved_profile(request.user["email"])
    status = 200 if result.get("success") else 404
    return jsonify(result), status


@codeforces.route("/verify", methods=["POST"])
@token_required
def verify():
    result = verify_account(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/sync", methods=["POST"])
@token_required
def sync():
    result = sync_profile(request.user["email"])
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@codeforces.route("/test", methods=["GET"])
def codeforces_test():
    return jsonify({
        "success": True,
        "message": "Codeforces routes working",
    }), 200
