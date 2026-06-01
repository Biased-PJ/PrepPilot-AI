from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.leaderboard_service import get_leaderboard

leaderboard = Blueprint("leaderboard", __name__)


@leaderboard.route("", methods=["GET"])
@leaderboard.route("/", methods=["GET"])
@token_required
def list_leaderboard():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit
    fetch_limit = offset + limit

    result = get_leaderboard(limit=fetch_limit)
    entries = result.get("leaderboard", [])
    paged = entries[offset:offset + limit]

    return jsonify({
        "success": True,
        "page": page,
        "limit": limit,
        "total": result.get("total_users", len(entries)),
        "leaderboard": paged,
    }), 200
