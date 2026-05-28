from flask import Blueprint, request, jsonify

from middleware.auth_middleware import (
    token_required
)

from middleware.rate_limit_middleware import (
    rate_limit
)

from services.question_service import (

    add_question,

    get_questions,

    search_questions,

    get_random_question,

    get_daily_question,

    get_company_questions,

    get_all_topics
)

from services.user_progress_service import (
    get_my_problems
)

from services.analytics_service import (
    compute_analytics
)

from services.recommendation_service import (
    get_recommendations
)

from services.readiness_service import (
    readiness_score
)

from services.streak_service import (
    get_streak
)

from services.topic_service import (
    get_topic_progress
)

from services.leaderboard_service import (
    get_leaderboard
)

from services.chart_service import (
    generate_user_chart
)

from services.unified_profile import (
    get_unified_stats
)

from services.import_service import (
    import_leetcode_questions
)

# =========================================================
# BLUEPRINT
# =========================================================

problems = Blueprint(

    "problems",

    __name__
)

# =========================================================
# TEST ROUTE
# =========================================================

@problems.route("/test", methods=["GET"])
def test_route():

    return jsonify({

        "success": True,

        "message":
            "Problems API working"
    }), 200

# =========================================================
# ADD QUESTION
# =========================================================

@problems.route(
    "/add-question",
    methods=["POST"]
)
@token_required
@rate_limit(max_requests=20, window_seconds=60)
def add_question():

    data = request.json or {}

    result = add_question(data)

    status_code = 201 if result.get(
        "success"
    ) else 400

    return jsonify(result), status_code

# =========================================================
# GET ALL QUESTIONS
# =========================================================

@problems.route(
    "/all-questions",
    methods=["GET"]
)
@token_required
def get_questions():

    filters = {

        "page":
            request.args.get("page", 1),

        "limit":
            request.args.get("limit", 20),

        "difficulty":
            request.args.get("difficulty"),

        "topic":
            request.args.get("topic"),

        "platform":
            request.args.get("platform"),

        "search":
            request.args.get("search")
    }

    result = get_questions(
        filters
    )

    return jsonify(result), 200

# =========================================================
# SEARCH QUESTIONS
# =========================================================

@problems.route(
    "/search-questions",
    methods=["GET"]
)
@token_required
def search_questions():

    keyword = request.args.get("q", "")

    result = search_questions(
        keyword
    )

    status_code = 200 if result.get(
        "success"
    ) else 400

    return jsonify(result), status_code

# =========================================================
# RANDOM QUESTION
# =========================================================

@problems.route(
    "/random-question",
    methods=["GET"]
)
@token_required
def get_random_question():

    result = get_random_question()

    status_code = 200 if result.get(
        "success"
    ) else 404

    return jsonify(result), status_code

# =========================================================
# DAILY QUESTION
# =========================================================

@problems.route(
    "/daily-question",
    methods=["GET"]
)
@token_required
def get_daily_question():

    result = get_daily_question()

    status_code = 200 if result.get(
        "success"
    ) else 404

    return jsonify(result), status_code

# =========================================================
# COMPANY QUESTIONS
# =========================================================

@problems.route(
    "/company-questions/<company>",
    methods=["GET"]
)
@token_required
def get_company_questions(company):

    result = get_company_questions(
        company
    )

    return jsonify(result), 200

# =========================================================
# TOPICS
# =========================================================

@problems.route(
    "/topics",
    methods=["GET"]
)
@token_required
def get_all_topics():

    result = get_all_topics()

    return jsonify(result), 200

# =========================================================
# MY PROBLEMS
# =========================================================

@problems.route(
    "/my-problems",
    methods=["GET"]
)
@token_required
def my_problems():

    result = get_my_problems(
        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# ANALYTICS
# =========================================================

@problems.route(
    "/analytics",
    methods=["GET"]
)
@token_required
def analytics():

    result = compute_analytics(
        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# RECOMMENDATIONS
# =========================================================

@problems.route(
    "/recommendations",
    methods=["GET"]
)
@token_required
def recommendations():

    result = get_recommendations(

        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# READINESS SCORE
# =========================================================

@problems.route(
    "/readiness-score",
    methods=["GET"]
)
@token_required
def readiness():

    result = readiness_score(

        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# STREAK
# =========================================================

@problems.route(
    "/streak",
    methods=["GET"]
)
@token_required
def streak():

    result = get_streak(
        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# TOPIC PROGRESS
# =========================================================

@problems.route(
    "/topic-progress",
    methods=["GET"]
)
@token_required
def topic_progress():

    result = get_topic_progress(

        request.user["email"]
    )

    return jsonify(result), 200

# =========================================================
# LEADERBOARD
# =========================================================

@problems.route(
    "/leaderboard",
    methods=["GET"]
)
@token_required
def leaderboard():

    result = get_leaderboard()

    return jsonify(result), 200

# =========================================================
# DASHBOARD
# =========================================================

@problems.route(
    "/dashboard",
    methods=["GET"]
)
@token_required
def dashboard():

    user_email = request.user["email"]

    stats = get_unified_stats(
        user_email
    )

    return jsonify({

        "success": True,

        "dashboard": stats
    }), 200

# =========================================================
# GENERATE CHART
# =========================================================

@problems.route(
    "/generate-chart",
    methods=["GET"]
)
@token_required
def generate_chart():

    result = generate_user_chart(

        request.user["email"]
    )

    status_code = 200 if result.get(
        "success"
    ) else 404

    return jsonify(result), status_code

# =========================================================
# IMPORT LEETCODE QUESTIONS
# =========================================================

@problems.route(
    "/import-leetcode-questions",
    methods=["POST"]
)
@token_required
def import_leetcode_questions():

    result = import_leetcode_questions()

    return jsonify(result), 200