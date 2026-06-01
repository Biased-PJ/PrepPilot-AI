from config import db
from bson import ObjectId
from datetime import datetime, timedelta

# =========================================================
# DIFFICULTY WEIGHTS
# =========================================================

DIFFICULTY_WEIGHTS = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 4
}

# =========================================================
# MAIN FUNCTION
# =========================================================

def get_my_problems(user_email):

    # =====================================================
    # FETCH USER PROGRESS
    # =====================================================

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        }).sort("solved_at", -1)

    )

    # =====================================================
    # EMPTY CASE
    # =====================================================

    if not progress_data:

        return {

            "total_solved": 0,

            "difficulty_breakdown": {},

            "topic_breakdown": {},

            "platform_breakdown": {},

            "recent_activity": [],

            "problem_stats": {},

            "problems": []
        }

    # =====================================================
    # INITIALIZE STATS
    # =====================================================

    results = []

    difficulty_breakdown = {
        "EASY": 0,
        "MEDIUM": 0,
        "HARD": 0
    }

    topic_breakdown = {}

    platform_breakdown = {}

    total_score = 0

    total_time = 0

    fastest_problem = None

    hardest_problem = None

    recent_activity = []

    solved_dates = set()

    # =====================================================
    # PROCESS DATA
    # =====================================================

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if not question:
            continue

        difficulty = (
            question.get(
                "difficulty",
                "EASY"
            ).upper()
        )

        topic = question.get(
            "topic",
            "General"
        )

        platform = question.get(
            "platform",
            "Unknown"
        )

        solved_at = progress.get(
            "solved_at"
        )

        time_taken = progress.get(
            "time_taken",
            0
        )

        # ---------------------------------------------
        # Difficulty Breakdown
        # ---------------------------------------------

        if difficulty in difficulty_breakdown:

            difficulty_breakdown[difficulty] += 1

        # ---------------------------------------------
        # Topic Breakdown
        # ---------------------------------------------

        topic_breakdown[topic] = (

            topic_breakdown.get(topic, 0)
            + 1
        )

        # ---------------------------------------------
        # Platform Breakdown
        # ---------------------------------------------

        platform_breakdown[platform] = (

            platform_breakdown.get(platform, 0)
            + 1
        )

        # ---------------------------------------------
        # Score
        # ---------------------------------------------

        total_score += (
            DIFFICULTY_WEIGHTS.get(
                difficulty,
                1
            )
        )

        # ---------------------------------------------
        # Time
        # ---------------------------------------------

        total_time += time_taken

        # ---------------------------------------------
        # Fastest Problem
        # ---------------------------------------------

        if time_taken > 0:

            if (

                fastest_problem is None

                or

                time_taken <
                fastest_problem["time_taken"]

            ):

                fastest_problem = {

                    "title":
                        question["title"],

                    "time_taken":
                        time_taken
                }

        # ---------------------------------------------
        # Hardest Problem
        # ---------------------------------------------

        if difficulty == "HARD":

            hardest_problem = {

                "title":
                    question["title"],

                "difficulty":
                    difficulty
            }

        # ---------------------------------------------
        # Solved Dates
        # ---------------------------------------------

        if solved_at:

            solved_dates.add(
                solved_at.date()
            )

        # ---------------------------------------------
        # Recent Activity
        # ---------------------------------------------

        recent_activity.append({

            "title":
                question["title"],

            "difficulty":
                difficulty,

            "topic":
                topic,

            "platform":
                platform,

            "solved_at":
                str(solved_at)
        })

        # ---------------------------------------------
        # Problem Entry
        # ---------------------------------------------

        results.append({

            "question_id":
                str(question["_id"]),

            "title":
                question.get("title"),

            "topic":
                topic,

            "difficulty":
                difficulty,

            "platform":
                platform,

            "companies":
                question.get(
                    "companies",
                    []
                ),

            "tags":
                question.get(
                    "tags",
                    []
                ),

            "status":
                progress.get(
                    "status",
                    "Solved"
                ),

            "time_taken":
                time_taken,

            "solved_at":
                str(solved_at),

            "difficulty_score":

                DIFFICULTY_WEIGHTS.get(
                    difficulty,
                    1
                )
        })

    # =====================================================
    # AVERAGE TIME
    # =====================================================

    average_time = 0

    if len(results) > 0:

        average_time = round(

            total_time / len(results),

            2
        )

    # =====================================================
    # MOST ACTIVE TOPIC
    # =====================================================

    most_active_topic = None

    if topic_breakdown:

        most_active_topic = max(

            topic_breakdown,

            key=topic_breakdown.get
        )

    # =====================================================
    # CURRENT STREAK
    # =====================================================

    current_streak = calculate_streak(
        solved_dates
    )

    # =====================================================
    # WEEKLY ACTIVITY
    # =====================================================

    weekly_activity = calculate_weekly_activity(
        solved_dates
    )

    # =====================================================
    # PERFORMANCE LEVEL
    # =====================================================

    performance_level = determine_performance(
        total_score
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # ---------------------------------------------
        # Overall Stats
        # ---------------------------------------------

        "total_solved":
            len(results),

        "total_score":
            total_score,

        "performance_level":
            performance_level,

        # ---------------------------------------------
        # Breakdowns
        # ---------------------------------------------

        "difficulty_breakdown":
            difficulty_breakdown,

        "topic_breakdown":
            topic_breakdown,

        "platform_breakdown":
            platform_breakdown,

        # ---------------------------------------------
        # Time Stats
        # ---------------------------------------------

        "average_time":
            average_time,

        "fastest_problem":
            fastest_problem,

        # ---------------------------------------------
        # Insights
        # ---------------------------------------------

        "hardest_problem":
            hardest_problem,

        "most_active_topic":
            most_active_topic,

        "current_streak":
            current_streak,

        # ---------------------------------------------
        # Activity
        # ---------------------------------------------

        "weekly_activity":
            weekly_activity,

        "recent_activity":
            recent_activity[:10],

        # ---------------------------------------------
        # Problems
        # ---------------------------------------------

        "problems":
            results
    }

# =========================================================
# CURRENT STREAK
# =========================================================

def calculate_streak(solved_dates):

    if not solved_dates:
        return 0

    dates = sorted(list(solved_dates))

    today = datetime.utcnow().date()

    yesterday = today - timedelta(days=1)

    latest = dates[-1]

    if latest not in [today, yesterday]:
        return 0

    streak = 1

    for i in range(
        len(dates) - 1,
        0,
        -1
    ):

        diff = (
            dates[i] -
            dates[i - 1]
        ).days

        if diff == 1:

            streak += 1

        else:

            break

    return streak

# =========================================================
# WEEKLY ACTIVITY
# =========================================================

def calculate_weekly_activity(solved_dates):

    today = datetime.utcnow().date()

    activity = {}

    for i in range(7):

        day = today - timedelta(days=i)

        activity[str(day)] = (

            1 if day in solved_dates
            else 0
        )

    return activity

# =========================================================
# PERFORMANCE LEVEL
# =========================================================

def determine_performance(total_score):

    if total_score >= 1000:
        return "Elite"

    elif total_score >= 500:
        return "Advanced"

    elif total_score >= 200:
        return "Intermediate"

    elif total_score >= 50:
        return "Beginner"

    return "Starter"

# =========================================================
# PROGRESS HELPERS
# =========================================================

def _parse_question_id(question_id):

    try:
        return ObjectId(question_id)
    except Exception:
        return None

def _progress_query(user_email, question_oid):

    return {
        "user_email": user_email,
        "question_id": question_oid
    }

# =========================================================
# MARK SOLVED
# =========================================================

def mark_problem_solved(user_email, question_id):

    question_oid = _parse_question_id(question_id)

    if not question_oid:
        return {
            "success": False,
            "message": "Invalid question id"
        }

    question = db.questions.find_one({
        "_id": question_oid
    })

    if not question:
        return {
            "success": False,
            "message": "Question not found"
        }

    existing = db.user_progress.find_one(
        _progress_query(user_email, question_oid)
    )

    update_fields = {
        "user_email": user_email,
        "question_id": question_oid,
        "status": "Solved",
        "solved_at": datetime.utcnow(),
        "bookmarked": existing.get("bookmarked", False)
        if existing
        else False
    }

    db.user_progress.update_one(
        _progress_query(user_email, question_oid),
        {"$set": update_fields},
        upsert=True
    )

    return {
        "success": True,
        "message": "Problem marked as solved",
        "question_id": str(question_oid)
    }

# =========================================================
# MARK UNSOLVED
# =========================================================

def mark_problem_unsolved(user_email, question_id):

    question_oid = _parse_question_id(question_id)

    if not question_oid:
        return {
            "success": False,
            "message": "Invalid question id"
        }

    existing = db.user_progress.find_one(
        _progress_query(user_email, question_oid)
    )

    if not existing:
        return {
            "success": True,
            "message": "Problem was not marked solved"
        }

    if existing.get("bookmarked"):
        db.user_progress.update_one(
            _progress_query(user_email, question_oid),
            {
                "$unset": {
                    "solved_at": "",
                    "status": ""
                },
                "$set": {
                    "status": "Bookmarked"
                }
            }
        )
    else:
        db.user_progress.delete_one(
            _progress_query(user_email, question_oid)
        )

    return {
        "success": True,
        "message": "Problem marked as unsolved",
        "question_id": str(question_oid)
    }

# =========================================================
# TOGGLE BOOKMARK
# =========================================================

def toggle_problem_bookmark(user_email, question_id):

    question_oid = _parse_question_id(question_id)

    if not question_oid:
        return {
            "success": False,
            "message": "Invalid question id"
        }

    question = db.questions.find_one({
        "_id": question_oid
    })

    if not question:
        return {
            "success": False,
            "message": "Question not found"
        }

    existing = db.user_progress.find_one(
        _progress_query(user_email, question_oid)
    )

    bookmarked = not existing.get("bookmarked", False) if existing else True

    update_fields = {
        "user_email": user_email,
        "question_id": question_oid,
        "bookmarked": bookmarked
    }

    if existing and existing.get("solved_at"):
        update_fields["status"] = existing.get("status", "Solved")
        update_fields["solved_at"] = existing.get("solved_at")
    elif bookmarked:
        update_fields["status"] = "Bookmarked"

    db.user_progress.update_one(
        _progress_query(user_email, question_oid),
        {"$set": update_fields},
        upsert=True
    )

    return {
        "success": True,
        "message": "Bookmark updated",
        "question_id": str(question_oid),
        "bookmarked": bookmarked
    }

# =========================================================
# QUESTION WITH USER STATE
# =========================================================

def get_question_with_user_state(user_email, question_id):

    from services.question_service import get_question_by_id

    question = get_question_by_id(question_id)

    if not question:
        return {
            "success": False,
            "message": "Question not found"
        }

    question_oid = _parse_question_id(question_id)

    progress = db.user_progress.find_one(
        _progress_query(user_email, question_oid)
    )

    question["solved"] = bool(
        progress and progress.get("solved_at")
    )

    question["bookmarked"] = bool(
        progress and progress.get("bookmarked")
    )

    return {
        "success": True,
        "question": question
    }

# =========================================================
# LIST QUESTIONS WITH USER STATE
# =========================================================

def list_questions_with_user_state(user_email, page, limit, filters):

    from services.question_service import get_questions

    page = int(page or 1)
    limit = int(limit or 20)

    result = get_questions(
        page=page,
        limit=limit,
        filters=filters
    )

    progress_rows = list(
        db.user_progress.find({
            "user_email": user_email
        })
    )

    progress_map = {
        str(row["question_id"]): row
        for row in progress_rows
    }

    for question in result.get("questions", []):
        progress = progress_map.get(question["question_id"])
        question["solved"] = bool(
            progress and progress.get("solved_at")
        )
        question["bookmarked"] = bool(
            progress and progress.get("bookmarked")
        )

    print("====== DEBUGGING PROBLEMS ENDPOINT ======")
    print(f"User Email: {user_email}")
    print(f"Filters received: {filters}")
    print(f"Result dictionary from question_service: {result}")
    print(f"Number of questions found: {len(result.get('questions', []))}")
    print("=========================================")
    
    return {
        "success": True,
        **result
    }