from flask import Blueprint, request, jsonify

from middleware.auth_middleware import token_required

from services.unified_profile import get_unified_stats
from services.topic_service import get_topic_progress
from services.readiness_service import readiness_score
from services.streak_service import get_streak

analytics = Blueprint("analytics", __name__)


@analytics.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    user_email = request.user["email"]
    stats = get_unified_stats(user_email)
    return jsonify({
        "success": True,
        "dashboard": stats,
    }), 200


@analytics.route("/topic-mastery", methods=["GET"])
@token_required
def topic_mastery():
    result = get_topic_progress(request.user["email"])
    return jsonify({
        "success": True,
        "topic_mastery": result,
    }), 200


@analytics.route("/readiness", methods=["GET"])
@token_required
def readiness():
    result = readiness_score(request.user["email"])
    return jsonify({
        "success": True,
        "readiness": result,
    }), 200


@analytics.route("/activity", methods=["GET"])
@token_required
def activity():
    result = get_streak(request.user["email"])
    return jsonify({
        "success": True,
        "activity": {
            "monthly_activity": result.get("monthly_activity", {}),
            "heatmap": result.get("heatmap", {}),
            "recent_activity": result.get("recent_activity", []),
            "current_streak": result.get("current_streak", 0),
            "longest_streak": result.get("longest_streak", 0),
            "consistency_score": result.get("consistency_score", 0),
        },
    }), 200
