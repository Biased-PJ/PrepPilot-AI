from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from middleware.rate_limit_middleware import rate_limit

from services.question_service import add_question as create_question
from services.user_progress_service import (
    list_questions_with_user_state,
    get_question_with_user_state,
    mark_problem_solved,
    mark_problem_unsolved,
    toggle_problem_bookmark,
)

problems = Blueprint("problems", __name__)


def _question_filters():
    """
    Extracts query parameter values and filters empty values out.
    Prevents empty parameters from muddying up MongoDB query dict builders.
    """
    raw_filters = {
        "difficulty": request.args.get("difficulty"),
        "topic": request.args.get("topic"),
        "platform": request.args.get("platform"),
        "search": request.args.get("search"),
        "tags": request.args.get("tags"),
        "companies": request.args.get("companies"),
        "paid_only": request.args.get("paid_only"),
    }
    
    cleaned_filters = {}
    for key, val in raw_filters.items():
        if val is not None and str(val).strip() != "" and str(val).lower() != "undefined":
            if key == "paid_only":
                cleaned_filters[key] = str(val).lower() in ["true", "1", "yes"]
            else:
                cleaned_filters[key] = val
                
    return cleaned_filters


@problems.route("", methods=["GET", "OPTIONS"])
@problems.route("/", methods=["GET", "OPTIONS"])
@token_required
def list_problems():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = max(1, min(100, int(request.args.get("limit", 20))))
    except (ValueError, TypeError):
        page = 1
        limit = 20

    try:
        result = list_questions_with_user_state(
            request.user["email"],
            page,
            limit,
            _question_filters(),
        )
        
        if not result or not isinstance(result, dict):
            return jsonify({
                "success": False, 
                "message": "Service layer failed to return structured response dictionary mapping blocks."
            }), 500
            
        if "success" not in result:
            result["success"] = True
            
        return jsonify(result), 200

    except Exception as e:
        print(f"💥 Critical Error inside list_problems endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


@problems.route("/<question_id>", methods=["GET"])
@token_required
def get_problem(question_id):
    result = get_question_with_user_state(
        request.user["email"],
        question_id,
    )
    status_code = 200 if result and result.get("success") else 404
    return jsonify(result), status_code


@problems.route("/<question_id>/solve", methods=["POST"])
@token_required
@rate_limit(max_requests=30, window_seconds=60)
def solve_problem(question_id):
    result = mark_problem_solved(
        request.user["email"],
        question_id,
    )
    status_code = 200 if result and result.get("success") else 400
    return jsonify(result), status_code


@problems.route("/<question_id>/unsolve", methods=["POST"])
@token_required
@rate_limit(max_requests=30, window_seconds=60)
def unsolve_problem(question_id):
    result = mark_problem_unsolved(
        request.user["email"],
        question_id,
    )
    status_code = 200 if result and result.get("success") else 400
    return jsonify(result), status_code


@problems.route("/<question_id>/bookmark", methods=["POST"])
@token_required
@rate_limit(max_requests=30, window_seconds=60)
def bookmark_problem(question_id):
    result = toggle_problem_bookmark(
        request.user["email"],
        question_id,
    )
    status_code = 200 if result and result.get("success") else 400
    return jsonify(result), status_code


@problems.route("/add-question", methods=["POST"])
@token_required
@rate_limit(max_requests=20, window_seconds=60)
def add_question_route():
    data = request.json or {}
    result = create_question(data)
    status_code = 201 if result and result.get("success") else 400
    return jsonify(result), status_code