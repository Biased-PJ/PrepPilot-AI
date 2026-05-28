from config import db
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
# MAIN TOPIC ANALYTICS
# =========================================================

def get_topic_progress(user_email):

    # =====================================================
    # FETCH USER DATA
    # =====================================================

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    # =====================================================
    # EMPTY CASE
    # =====================================================

    if not progress_data:

        return {

            "total_topics_solved": 0,

            "topic_coverage": 0,

            "strong_topics": [],

            "weak_topics": [],

            "topic_progress": {},

            "recommended_topics": []
        }

    # =====================================================
    # INITIALIZE
    # =====================================================

    topic_stats = {}

    solved_dates = {}

    recent_topics = {}

    total_score = 0

    # =====================================================
    # PROCESS USER PROGRESS
    # =====================================================

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if not question:
            continue

        topic = question.get(
            "topic",
            "General"
        )

        difficulty = (
            question.get(
                "difficulty",
                "EASY"
            ).upper()
        )

        solved_at = progress.get(
            "solved_at"
        )

        time_taken = progress.get(
            "time_taken",
            0
        )

        # ---------------------------------------------
        # CREATE TOPIC OBJECT
        # ---------------------------------------------

        if topic not in topic_stats:

            topic_stats[topic] = {

                "solved": 0,

                "easy": 0,

                "medium": 0,

                "hard": 0,

                "score": 0,

                "total_time": 0,

                "average_time": 0,

                "last_solved": None,

                "consistency": 0
            }

        # ---------------------------------------------
        # SOLVED COUNT
        # ---------------------------------------------

        topic_stats[topic]["solved"] += 1

        # ---------------------------------------------
        # DIFFICULTY COUNTS
        # ---------------------------------------------

        if difficulty == "EASY":

            topic_stats[topic]["easy"] += 1

        elif difficulty == "MEDIUM":

            topic_stats[topic]["medium"] += 1

        elif difficulty == "HARD":

            topic_stats[topic]["hard"] += 1

        # ---------------------------------------------
        # SCORE
        # ---------------------------------------------

        score = DIFFICULTY_WEIGHTS.get(
            difficulty,
            1
        )

        topic_stats[topic]["score"] += score

        total_score += score

        # ---------------------------------------------
        # TIME TRACKING
        # ---------------------------------------------

        topic_stats[topic]["total_time"] += (
            time_taken
        )

        # ---------------------------------------------
        # LAST SOLVED
        # ---------------------------------------------

        if solved_at:

            if (

                topic_stats[topic]["last_solved"]
                is None

                or

                solved_at >
                topic_stats[topic]["last_solved"]

            ):

                topic_stats[topic][
                    "last_solved"
                ] = solved_at

            # -----------------------------------------
            # TRACK SOLVED DATES
            # -----------------------------------------

            if topic not in solved_dates:

                solved_dates[topic] = set()

            solved_dates[topic].add(
                solved_at.date()
            )

    # =====================================================
    # FINALIZE TOPIC METRICS
    # =====================================================

    for topic, stats in topic_stats.items():

        # ---------------------------------------------
        # AVERAGE TIME
        # ---------------------------------------------

        if stats["solved"] > 0:

            stats["average_time"] = round(

                stats["total_time"] /
                stats["solved"],

                2
            )

        # ---------------------------------------------
        # CONSISTENCY
        # ---------------------------------------------

        stats["consistency"] = (
            calculate_topic_consistency(

                solved_dates.get(topic, set())
            )
        )

        # ---------------------------------------------
        # MASTERY LEVEL
        # ---------------------------------------------

        stats["mastery"] = determine_mastery(
            stats
        )

        # ---------------------------------------------
        # REMOVE RAW TIME
        # ---------------------------------------------

        del stats["total_time"]

    # =====================================================
    # STRONG / WEAK TOPICS
    # =====================================================

    sorted_topics = sorted(

        topic_stats.items(),

        key=lambda x: x[1]["score"],

        reverse=True
    )

    strong_topics = [

        {
            "topic": t[0],
            "score": t[1]["score"]
        }

        for t in sorted_topics[:5]
    ]

    weak_topics = [

        {
            "topic": t[0],
            "score": t[1]["score"]
        }

        for t in sorted_topics[-5:]
    ]

    # =====================================================
    # TOPIC COVERAGE
    # =====================================================

    total_topics = len(
        db.questions.distinct("topic")
    )

    coverage = 0

    if total_topics > 0:

        coverage = round(

            (len(topic_stats) / total_topics)
            * 100,

            2
        )

    # =====================================================
    # RECOMMENDED TOPICS
    # =====================================================

    recommended_topics = recommend_topics(
        topic_stats
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # ---------------------------------------------
        # Overview
        # ---------------------------------------------

        "total_topics_solved":
            len(topic_stats),

        "topic_coverage":
            coverage,

        "overall_topic_score":
            total_score,

        # ---------------------------------------------
        # Topic Insights
        # ---------------------------------------------

        "strong_topics":
            strong_topics,

        "weak_topics":
            weak_topics,

        "recommended_topics":
            recommended_topics,

        # ---------------------------------------------
        # Detailed Analytics
        # ---------------------------------------------

        "topic_progress":
            topic_stats
    }

# =========================================================
# TOPIC CONSISTENCY
# =========================================================

def calculate_topic_consistency(solved_dates):

    if not solved_dates:
        return 0

    today = datetime.utcnow().date()

    active = 0

    for i in range(30):

        day = today - timedelta(days=i)

        if day in solved_dates:

            active += 1

    return round(

        (active / 30) * 100,

        2
    )

# =========================================================
# MASTERY LEVEL
# =========================================================

def determine_mastery(stats):

    solved = stats["solved"]

    hard = stats["hard"]

    consistency = stats["consistency"]

    if (
        solved >= 50
        and hard >= 10
        and consistency >= 60
    ):

        return "Expert"

    elif (
        solved >= 30
        and hard >= 5
    ):

        return "Advanced"

    elif solved >= 15:

        return "Intermediate"

    elif solved >= 5:

        return "Beginner"

    return "Starter"

# =========================================================
# RECOMMEND TOPICS
# =========================================================

def recommend_topics(topic_stats):

    recommendations = []

    # =====================================================
    # LOW SCORE TOPICS
    # =====================================================

    sorted_topics = sorted(

        topic_stats.items(),

        key=lambda x: x[1]["score"]
    )

    for topic, stats in sorted_topics[:5]:

        recommendations.append({

            "topic": topic,

            "reason":
                "Weak performance",

            "current_score":
                stats["score"]
        })

    # =====================================================
    # LOW CONSISTENCY
    # =====================================================

    for topic, stats in topic_stats.items():

        if stats["consistency"] < 20:

            recommendations.append({

                "topic": topic,

                "reason":
                    "Low recent practice",

                "consistency":
                    stats["consistency"]
            })

    return recommendations[:10]