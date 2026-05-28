from config import db
from datetime import datetime, timedelta
import random

# =========================================================
# DIFFICULTY ORDER
# =========================================================

DIFFICULTY_ORDER = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 3
}

# =========================================================
# COMPANY QUESTION PATTERNS
# =========================================================

COMPANY_FOCUS = {

    "Amazon": [
        "Arrays",
        "Strings",
        "Hash Table",
        "Trees",
        "Greedy"
    ],

    "Google": [
        "Graphs",
        "Dynamic Programming",
        "Trees",
        "Backtracking"
    ],

    "Microsoft": [
        "Arrays",
        "Trees",
        "Strings",
        "Heap"
    ],

    "Adobe": [
        "Arrays",
        "Strings",
        "Stack"
    ]
}

# =========================================================
# MAIN RECOMMENDATION FUNCTION
# =========================================================

def get_recommendations(user_email):

    # =====================================================
    # FETCH USER PROGRESS
    # =====================================================

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    # =====================================================
    # NEW USER CASE
    # =====================================================

    if not progress_data:

        return starter_recommendations()

    # =====================================================
    # INITIALIZE STATS
    # =====================================================

    topic_frequency = {}

    difficulty_stats = {
        "EASY": 0,
        "MEDIUM": 0,
        "HARD": 0
    }

    solved_ids = set()

    recent_topics = []

    avg_time = 0

    total_time = 0

    active_days = set()

    # =====================================================
    # PROCESS USER DATA
    # =====================================================

    for progress in progress_data:

        solved_ids.add(
            progress["question_id"]
        )

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

        # ---------------------------------------------
        # Topic Frequency
        # ---------------------------------------------

        topic_frequency[topic] = (
            topic_frequency.get(topic, 0) + 1
        )

        # ---------------------------------------------
        # Difficulty Frequency
        # ---------------------------------------------

        if difficulty in difficulty_stats:

            difficulty_stats[difficulty] += 1

        # ---------------------------------------------
        # Recent Topics
        # ---------------------------------------------

        solved_at = progress.get("solved_at")

        if solved_at:

            recent_topics.append({
                "topic": topic,
                "date": solved_at
            })

            active_days.add(
                solved_at.date()
            )

        # ---------------------------------------------
        # Time Tracking
        # ---------------------------------------------

        total_time += progress.get(
            "time_taken",
            0
        )

    # =====================================================
    # AVERAGE TIME
    # =====================================================

    if len(progress_data) > 0:

        avg_time = round(

            total_time /
            len(progress_data),

            2
        )

    # =====================================================
    # DETERMINE USER LEVEL
    # =====================================================

    level = determine_user_level(
        difficulty_stats
    )

    # =====================================================
    # FIND WEAK TOPICS
    # =====================================================

    weak_topics = get_weak_topics(
        topic_frequency
    )

    # =====================================================
    # FIND NEGLECTED TOPICS
    # =====================================================

    neglected_topics = get_neglected_topics(
        recent_topics
    )

    # =====================================================
    # DETECT BURNOUT
    # =====================================================

    burnout_risk = detect_burnout(
        active_days
    )

    # =====================================================
    # RECOMMENDATION TYPES
    # =====================================================

    recommendations = {

        "weak_topic_questions":
            recommend_weak_topics(

                weak_topics,
                solved_ids,
                level
            ),

        "difficulty_upgrade":
            recommend_difficulty_upgrade(

                solved_ids,
                level
            ),

        "revision_questions":
            recommend_revision_questions(

                topic_frequency,
                solved_ids
            ),

        "company_preparation":
            recommend_company_questions(

                solved_ids,
                level
            ),

        "neglected_topics":
            recommend_neglected_topics(

                neglected_topics,
                solved_ids
            ),

        "daily_goal":
            generate_daily_goal(

                level,
                weak_topics,
                burnout_risk
            )
    }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "user_level":
            level,

        "average_time":
            avg_time,

        "burnout_risk":
            burnout_risk,

        "weak_topics":
            weak_topics,

        "recommendations":
            recommendations
    }

# =========================================================
# STARTER RECOMMENDATIONS
# =========================================================

def starter_recommendations():

    questions = list(

        db.questions.find({
            "difficulty": "EASY"
        }).limit(10)

    )

    return {

        "user_level": "Starter",

        "message":
            "Start with easy problems",

        "recommendations": {

            "starter_questions": [

                serialize_question(q)

                for q in questions
            ]
        }
    }

# =========================================================
# USER LEVEL
# =========================================================

def determine_user_level(difficulty_stats):

    hard = difficulty_stats["HARD"]

    medium = difficulty_stats["MEDIUM"]

    total = (
        difficulty_stats["EASY"] +
        medium +
        hard
    )

    if hard >= 100:
        return "Advanced"

    if medium >= 150:
        return "Intermediate"

    if total >= 50:
        return "Beginner"

    return "Starter"

# =========================================================
# WEAK TOPICS
# =========================================================

def get_weak_topics(topic_frequency):

    if not topic_frequency:
        return []

    sorted_topics = sorted(

        topic_frequency.items(),

        key=lambda x: x[1]
    )

    return [

        topic[0]

        for topic in sorted_topics[:5]
    ]

# =========================================================
# NEGLECTED TOPICS
# =========================================================

def get_neglected_topics(recent_topics):

    if not recent_topics:
        return []

    latest_by_topic = {}

    for item in recent_topics:

        topic = item["topic"]

        date = item["date"]

        if (
            topic not in latest_by_topic
            or date > latest_by_topic[topic]
        ):

            latest_by_topic[topic] = date

    neglected = []

    today = datetime.utcnow()

    for topic, last_date in latest_by_topic.items():

        days_gap = (
            today - last_date
        ).days

        if days_gap >= 14:

            neglected.append(topic)

    return neglected

# =========================================================
# BURNOUT DETECTION
# =========================================================

def detect_burnout(active_days):

    today = datetime.utcnow().date()

    recent_active = 0

    for i in range(7):

        if (
            today - timedelta(days=i)
        ) in active_days:

            recent_active += 1

    if recent_active >= 7:
        return "HIGH"

    elif recent_active >= 5:
        return "MEDIUM"

    return "LOW"

# =========================================================
# WEAK TOPIC RECOMMENDATIONS
# =========================================================

def recommend_weak_topics(

    weak_topics,
    solved_ids,
    level
):

    difficulty = get_target_difficulty(
        level
    )

    questions = list(

        db.questions.find({

            "topic": {
                "$in": weak_topics
            },

            "difficulty": difficulty,

            "_id": {
                "$nin": list(solved_ids)
            }

        }).limit(10)

    )

    return [
        serialize_question(q)
        for q in questions
    ]

# =========================================================
# DIFFICULTY UPGRADE
# =========================================================

def recommend_difficulty_upgrade(

    solved_ids,
    level
):

    target = "MEDIUM"

    if level == "Intermediate":
        target = "HARD"

    questions = list(

        db.questions.find({

            "difficulty": target,

            "_id": {
                "$nin": list(solved_ids)
            }

        }).limit(10)

    )

    return [
        serialize_question(q)
        for q in questions
    ]

# =========================================================
# REVISION QUESTIONS
# =========================================================

def recommend_revision_questions(

    topic_frequency,
    solved_ids
):

    strong_topics = sorted(

        topic_frequency.items(),

        key=lambda x: x[1],

        reverse=True
    )

    strong_topics = [

        t[0]

        for t in strong_topics[:3]
    ]

    questions = list(

        db.questions.find({

            "topic": {
                "$in": strong_topics
            },

            "_id": {
                "$nin": list(solved_ids)
            }

        }).limit(10)

    )

    return [
        serialize_question(q)
        for q in questions
    ]

# =========================================================
# COMPANY PREPARATION
# =========================================================

def recommend_company_questions(

    solved_ids,
    level
):

    company = random.choice(
        list(COMPANY_FOCUS.keys())
    )

    topics = COMPANY_FOCUS[company]

    difficulty = get_target_difficulty(
        level
    )

    questions = list(

        db.questions.find({

            "topic": {
                "$in": topics
            },

            "difficulty": difficulty,

            "_id": {
                "$nin": list(solved_ids)
            }

        }).limit(10)

    )

    return {

        "company": company,

        "questions": [

            serialize_question(q)

            for q in questions
        ]
    }

# =========================================================
# NEGLECTED TOPICS RECOMMENDATION
# =========================================================

def recommend_neglected_topics(

    neglected_topics,
    solved_ids
):

    questions = list(

        db.questions.find({

            "topic": {
                "$in": neglected_topics
            },

            "_id": {
                "$nin": list(solved_ids)
            }

        }).limit(10)

    )

    return [
        serialize_question(q)
        for q in questions
    ]

# =========================================================
# DAILY GOAL GENERATOR
# =========================================================

def generate_daily_goal(

    level,
    weak_topics,
    burnout_risk
):

    goal = {

        "problems": 2,

        "revision": 1,

        "topics": weak_topics[:2]
    }

    if level == "Intermediate":

        goal["problems"] = 4

    elif level == "Advanced":

        goal["problems"] = 6

    if burnout_risk == "HIGH":

        goal["problems"] -= 2

    return goal

# =========================================================
# TARGET DIFFICULTY
# =========================================================

def get_target_difficulty(level):

    if level == "Starter":
        return "EASY"

    if level == "Beginner":
        return "EASY"

    if level == "Intermediate":
        return "MEDIUM"

    return "HARD"

# =========================================================
# SERIALIZER
# =========================================================

def serialize_question(question):

    return {

        "question_id":
            str(question["_id"]),

        "title":
            question.get("title"),

        "topic":
            question.get("topic"),

        "difficulty":
            question.get("difficulty"),

        "platform":
            question.get("platform"),

        "link":
            question.get("link")
    }