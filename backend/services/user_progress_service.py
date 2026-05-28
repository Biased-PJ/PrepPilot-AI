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