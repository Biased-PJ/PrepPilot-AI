from config import db
from services.unified_profile import get_unified_stats
from datetime import datetime, timedelta

# =========================================================
# CONSTANTS
# =========================================================

DIFFICULTY_WEIGHTS = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 4
}

COMPANY_PATTERNS = {
    "Amazon": {
        "Arrays": 20,
        "Strings": 15,
        "Hash Table": 10,
        "Trees": 10
    },

    "Google": {
        "Graphs": 20,
        "Dynamic Programming": 20,
        "Trees": 15,
        "Backtracking": 10
    },

    "Microsoft": {
        "Arrays": 15,
        "Trees": 15,
        "Strings": 10,
        "Linked List": 10
    }
}

# =========================================================
# MAIN ANALYTICS FUNCTION
# =========================================================

def compute_analytics(user_email):

    # =====================================================
    # USER PROGRESS
    # =====================================================

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    # =====================================================
    # PLATFORM STATS
    # =====================================================

    platform_stats = get_unified_stats(user_email)

    # =====================================================
    # INITIAL VALUES
    # =====================================================

    topic_stats = {}

    difficulty_breakdown = {
        "EASY": 0,
        "MEDIUM": 0,
        "HARD": 0
    }

    total_time = 0

    active_days = set()

    solved_dates = []

    weighted_score = 0

    hardest_problem = "NONE"

    solved_question_ids = []

    # =====================================================
    # PROCESS USER PROGRESS
    # =====================================================

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if not question:
            continue

        solved_question_ids.append(progress["question_id"])

        topic = question.get("topic", "General")

        difficulty = (
            question.get("difficulty", "EASY")
            .upper()
        )

        # ---------------------------------------------
        # Topic Stats
        # ---------------------------------------------

        topic_stats[topic] = (
            topic_stats.get(topic, 0) + 1
        )

        # ---------------------------------------------
        # Difficulty Breakdown
        # ---------------------------------------------

        if difficulty in difficulty_breakdown:

            difficulty_breakdown[difficulty] += 1

        # ---------------------------------------------
        # Weighted Difficulty Score
        # ---------------------------------------------

        weighted_score += (
            DIFFICULTY_WEIGHTS.get(difficulty, 1)
        )

        # ---------------------------------------------
        # Hardest Problem
        # ---------------------------------------------

        if difficulty == "HARD":
            hardest_problem = "HARD"

        elif (
            difficulty == "MEDIUM"
            and hardest_problem != "HARD"
        ):
            hardest_problem = "MEDIUM"

        elif hardest_problem == "NONE":
            hardest_problem = "EASY"

        # ---------------------------------------------
        # Time Tracking
        # ---------------------------------------------

        total_time += progress.get(
            "time_taken",
            0
        )

        # ---------------------------------------------
        # Streak Tracking
        # ---------------------------------------------

        solved_at = progress.get("solved_at")

        if solved_at:

            day = solved_at.date()

            active_days.add(day)

            solved_dates.append(day)

    # =====================================================
    # TOTALS
    # =====================================================

    local_total = len(progress_data)

    total_solved = (
        local_total +
        platform_stats["total"]
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
            (len(topic_stats) / total_topics) * 100,
            2
        )

    # =====================================================
    # AVERAGE TIME
    # =====================================================

    avg_time = 0

    if local_total > 0:

        avg_time = round(
            total_time / local_total,
            2
        )

    # =====================================================
    # STREAK CALCULATION
    # =====================================================

    current_streak = calculate_streak(
        solved_dates
    )

    # =====================================================
    # CONSISTENCY SCORE
    # =====================================================

    consistency_score = calculate_consistency(
        active_days
    )

    # =====================================================
    # STRONG / WEAK TOPICS
    # =====================================================

    sorted_topics = sorted(

        topic_stats.items(),

        key=lambda x: x[1],

        reverse=True
    )

    strong_topics = [
        t[0]
        for t in sorted_topics[:5]
    ]

    weak_topics = [
        t[0]
        for t in sorted_topics[-5:]
    ]

    # =====================================================
    # INTERVIEW READINESS
    # =====================================================

    interview_readiness = calculate_readiness(

        total_solved=total_solved,

        hard_solved=(
            difficulty_breakdown["HARD"]
        ),

        streak=current_streak,

        topic_coverage=topic_coverage,

        consistency_score=consistency_score
    )

    # =====================================================
    # COMPANY READINESS
    # =====================================================

    company_readiness = {}

    for company, pattern in COMPANY_PATTERNS.items():

        score = 0
        max_score = 0

        for topic, required_count in pattern.items():

            user_count = topic_stats.get(
                topic,
                0
            )

            score += min(
                user_count / required_count,
                1
            ) * 100

            max_score += 100

        company_readiness[company] = round(
            score / max_score * 100,
            2
        )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # ---------------------------------------------
        # Overall Stats
        # ---------------------------------------------

        "total_solved": total_solved,

        "local_solved": local_total,

        "platform_stats": platform_stats,

        # ---------------------------------------------
        # Difficulty
        # ---------------------------------------------

        "difficulty_breakdown":
            difficulty_breakdown,

        "difficulty_score":
            weighted_score,

        "hardest_problem_solved":
            hardest_problem,

        # ---------------------------------------------
        # Topics
        # ---------------------------------------------

        "topic_coverage":
            topic_coverage,

        "topics_solved":
            topic_stats,

        "strong_topics":
            strong_topics,

        "weak_topics":
            weak_topics,

        # ---------------------------------------------
        # Productivity
        # ---------------------------------------------

        "average_time_per_problem":
            avg_time,

        "active_days":
            len(active_days),

        "current_streak":
            current_streak,

        "consistency_score":
            consistency_score,

        # ---------------------------------------------
        # Readiness
        # ---------------------------------------------

        "interview_readiness":
            interview_readiness,

        "company_readiness":
            company_readiness
    }

# =========================================================
# STREAK CALCULATION
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
# CONSISTENCY SCORE
# =========================================================

def calculate_consistency(active_days):

    if not active_days:
        return 0

    today = datetime.utcnow().date()

    last_30_days = set()

    for i in range(30):

        last_30_days.add(
            today - timedelta(days=i)
        )

    active_last_30 = len(
        active_days.intersection(last_30_days)
    )

    return round(
        (active_last_30 / 30) * 100,
        2
    )

# =========================================================
# READINESS CALCULATION
# =========================================================

def calculate_readiness(
    total_solved,
    hard_solved,
    streak,
    topic_coverage,
    consistency_score
):

    score = (

        total_solved * 0.25 +

        hard_solved * 3 +

        streak * 2 +

        topic_coverage * 0.8 +

        consistency_score * 0.5
    )

    return round(
        min(score / 5, 100),
        2
    )