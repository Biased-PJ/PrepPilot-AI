from flask import Blueprint, jsonify

from middleware.auth_middleware import token_required

from services.recommendation_service import get_recommendations
from services.topic_service import get_topic_progress
from services.readiness_service import readiness_score

recommendations = Blueprint("recommendations", __name__)


@recommendations.route("", methods=["GET"])
@recommendations.route("/", methods=["GET"])
@token_required
def list_recommendations():
    result = get_recommendations(request.user["email"])
    return jsonify({
        "success": True,
        "recommendations": result,
    }), 200


@recommendations.route("/weak-topics", methods=["GET"])
@token_required
def weak_topics():
    topics = get_topic_progress(request.user["email"])
    return jsonify({
        "success": True,
        "weak_topics": topics.get("weak_topics", []),
        "recommended_topics": topics.get("recommended_topics", []),
        "topic_progress": topics.get("topic_progress", {}),
    }), 200


@recommendations.route("/roadmap", methods=["GET"])
@token_required
def roadmap():
    result = readiness_score(request.user["email"])
    return jsonify({
        "success": True,
        "roadmap": {
            "readiness_score": result.get("readiness_score"),
            "level": result.get("level"),
            "company_readiness": result.get("company_readiness", {}),
            "weak_topics": result.get("weak_topics", []),
            "topics": result.get("topics", {}),
            "breakdown": result.get("breakdown", {}),
        },
    }), 200
