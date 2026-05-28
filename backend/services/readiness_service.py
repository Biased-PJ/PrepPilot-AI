from config import db
from services.unified_profile import get_unified_stats
from datetime import datetime, timedelta

# =========================================================
# COMPANY REQUIREMENTS
# =========================================================

COMPANY_PROFILES = {

    "Amazon": {
        "min_total": 250,
        "min_hard": 25,
        "important_topics": [
            "Arrays",
            "Strings",
            "Hash Table",
            "Trees",
            "Greedy"
        ]
    },

    "Google": {
        "min_total": 450,
        "min_hard": 80,
        "important_topics": [
            "Graphs",
            "Dynamic Programming",
            "Trees",
            "Backtracking",
            "Binary Search"
        ]
    },

    "Microsoft": {
        "min_total": 200,
        "min_hard": 20,
        "important_topics": [
            "Arrays",
            "Trees",
            "Strings",
            "Linked List",
            "Heap"
        ]
    },

    "Adobe": {
        "min_total": 180,
        "min_hard": 15,
        "important_topics": [
            "Arrays",
            "Strings",
            "Trees",
            "Stack"
        ]
    },

    "Flipkart": {
        "min_total": 220,
        "min_hard": 25,
        "important_topics": [
            "Graphs",
            "DP",
            "Trees",
            "Greedy"
        ]
    }
}

# =========================================================
# MAIN READINESS FUNCTION
# =========================================================

def readiness_score(user_email):

    # =====================================================
    # FETCH DATA
    # =====================================================

    progress_data = list(
        db.user_progress.find({
            "user_email": user_email
        })
    )

    platform_stats = get_unified_stats(
        user_email
    )

    # =====================================================
    # INITIAL STATS
    # =====================================================

    topic_stats = {}

    easy = medium = hard = 0

    total_time = 0

    active_days = set()

    solved_dates = []

    # =====================================================
    # PROCESS LOCAL PROGRESS
    # =====================================================

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if not question:
            continue

        difficulty = (
            question.get("difficulty", "EASY")
            .upper()
        )

        topic = question.get(
            "topic",
            "General"
        )

        # ---------------------------------------------
        # Difficulty
        # ---------------------------------------------

        if difficulty == "EASY":
            easy += 1

        elif difficulty == "MEDIUM":
            medium += 1

        elif difficulty == "HARD":
            hard += 1

        # ---------------------------------------------
        # Topics
        # ---------------------------------------------

        topic_stats[topic] = (
            topic_stats.get(topic, 0) + 1
        )

        # ---------------------------------------------
        # Time Tracking
        # ---------------------------------------------

        total_time += progress.get(
            "time_taken",
            0
        )

        # ---------------------------------------------
        # Activity Tracking
        # ---------------------------------------------

        solved_at = progress.get("solved_at")

        if solved_at:

            day = solved_at.date()

            active_days.add(day)

            solved_dates.append(day)

    # =====================================================
    # MERGE PLATFORM STATS
    # =====================================================

    easy += platform_stats.get("easy", 0)

    medium += platform_stats.get("medium", 0)

    hard += platform_stats.get("hard", 0)

    total_solved = easy + medium + hard

    # =====================================================
    # STREAK
    # =====================================================

    streak = calculate_streak(
        solved_dates
    )

    # =====================================================
    # TOPIC COVERAGE
    # =====================================================

    total_topics = len(
        db.questions.distinct("topic")
    )

    topic_coverage = 0

    if total_topics > 0:

        topic_coverage = round(

            (len(topic_stats) / total_topics)
            * 100,

            2
        )

    # =====================================================
    # CONSISTENCY SCORE
    # =====================================================

    consistency = calculate_consistency(
        active_days
    )

    # =====================================================
    # AVERAGE TIME
    # =====================================================

    avg_time = 0

    if len(progress_data) > 0:

        avg_time = round(
            total_time / len(progress_data),
            2
        )

    # =====================================================
    # CORE READINESS SCORE
    # =====================================================

    readiness = calculate_core_readiness(

        total_solved=total_solved,

        easy=easy,

        medium=medium,

        hard=hard,

        streak=streak,

        consistency=consistency,

        topic_coverage=topic_coverage,

        avg_time=avg_time
    )

    # =====================================================
    # LEVEL
    # =====================================================

    level = determine_level(
        readiness
    )

    # =====================================================
    # COMPANY SCORES
    # =====================================================

    company_scores = {}

    for company, profile in COMPANY_PROFILES.items():

        company_scores[company] = (
            calculate_company_readiness(

                profile=profile,

                total_solved=total_solved,

                hard_solved=hard,

                topic_stats=topic_stats
            )
        )

    # =====================================================
    # IMPROVEMENT AREAS
    # =====================================================

    weak_topics = get_weak_topics(
        topic_stats
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # ---------------------------------------------
        # Main Readiness
        # ---------------------------------------------

        "readiness_score":
            readiness,

        "level":
            level,

        # ---------------------------------------------
        # Breakdown
        # ---------------------------------------------

        "breakdown": {

            "easy_solved": easy,

            "medium_solved": medium,

            "hard_solved": hard,

            "total_solved":
                total_solved,

            "topic_coverage":
                topic_coverage,

            "streak":
                streak,

            "consistency":
                consistency,

            "average_time":
                avg_time
        },

        # ---------------------------------------------
        # Topics
        # ---------------------------------------------

        "topics":
            topic_stats,

        "weak_topics":
            weak_topics,

        # ---------------------------------------------
        # Companies
        # ---------------------------------------------

        "company_readiness":
            company_scores
    }

# =========================================================
# CORE READINESS FORMULA
# =========================================================

def calculate_core_readiness(

    total_solved,

    easy,

    medium,

    hard,

    streak,

    consistency,

    topic_coverage,

    avg_time
):

    # =====================================================
    # PROBLEM SCORE
    # =====================================================

    problem_score = (

        easy * 1 +

        medium * 2 +

        hard * 5
    )

    # =====================================================
    # STREAK BONUS
    # =====================================================

    streak_bonus = streak * 2

    # =====================================================
    # CONSISTENCY BONUS
    # =====================================================

    consistency_bonus = (
        consistency * 0.6
    )

    # =====================================================
    # TOPIC BONUS
    # =====================================================

    topic_bonus = (
        topic_coverage * 1.2
    )

    # =====================================================
    # SPEED BONUS
    # =====================================================

    speed_bonus = 0

    if avg_time > 0:

        if avg_time <= 20:
            speed_bonus = 25

        elif avg_time <= 40:
            speed_bonus = 15

        elif avg_time <= 60:
            speed_bonus = 8

    # =====================================================
    # FINAL SCORE
    # =====================================================

    score = (

        problem_score +

        streak_bonus +

        consistency_bonus +

        topic_bonus +

        speed_bonus
    )

    return round(
        min(score / 10, 100),
        2
    )

# =========================================================
# STREAK
# =========================================================

def calculate_streak(solved_dates):

    if not solved_dates:
        return 0

    solved_dates = sorted(
        list(set(solved_dates))
    )

    streak = 1

    for i in range(
        len(solved_dates) - 1,
        0,
        -1
    ):

        diff = (
            solved_dates[i] -
            solved_dates[i - 1]
        ).days

        if diff == 1:
            streak += 1

        else:
            break

    return streak

# =========================================================
# CONSISTENCY
# =========================================================

def calculate_consistency(active_days):

    if not active_days:
        return 0

    today = datetime.utcnow().date()

    count = 0

    for i in range(30):

        day = today - timedelta(days=i)

        if day in active_days:
            count += 1

    return round(
        (count / 30) * 100,
        2
    )

# =========================================================
# USER LEVEL
# =========================================================

def determine_level(score):

    if score >= 85:
        return "Interview Ready"

    elif score >= 70:
        return "Advanced"

    elif score >= 50:
        return "Intermediate"

    elif score >= 30:
        return "Beginner"

    return "Starter"

# =========================================================
# COMPANY READINESS
# =========================================================

def calculate_company_readiness(

    profile,

    total_solved,

    hard_solved,

    topic_stats
):

    # =====================================================
    # TOTAL SCORE
    # =====================================================

    total_score = min(

        total_solved /
        profile["min_total"],

        1
    ) * 40

    # =====================================================
    # HARD SCORE
    # =====================================================

    hard_score = min(

        hard_solved /
        profile["min_hard"],

        1
    ) * 30

    # =====================================================
    # TOPIC SCORE
    # =====================================================

    topic_score = 0

    important_topics = (
        profile["important_topics"]
    )

    for topic in important_topics:

        if topic_stats.get(topic, 0) >= 10:

            topic_score += (
                30 / len(important_topics)
            )

    final_score = (

        total_score +

        hard_score +

        topic_score
    )

    return round(
        min(final_score, 100),
        2
    )

# =========================================================
# WEAK TOPICS
# =========================================================

def get_weak_topics(topic_stats):

    if not topic_stats:
        return []

    sorted_topics = sorted(

        topic_stats.items(),

        key=lambda x: x[1]
    )

    return [

        topic[0]

        for topic in sorted_topics[:5]
    ]