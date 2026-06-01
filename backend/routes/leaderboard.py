from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.leaderboard_service import get_leaderboard

leaderboard = Blueprint("leaderboard", __name__)


# Inside your routes/leaderboard.py file:

@leaderboard.route("", methods=["GET"])
@leaderboard.route("/", methods=["GET"])
@token_required
def list_leaderboard():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit
    fetch_limit = offset + limit

    # Pass the active token session email down into the service helper execution
    current_email = request.user.get("email") if hasattr(request, "user") else None
    
    result = get_leaderboard(limit=fetch_limit, current_user_email=current_email)
    entries = result.get("leaderboard", [])
    paged = entries[offset:offset + limit]

    return jsonify({
        "success": True,
        "page": page,
        "limit": limit,
        "total": result.get("total_users", len(entries)),
        "leaderboard": paged,
    }), 200