from services.unified_profile import get_unified_stats
from config import db


def get_recommendations(user_email):

    progress_data = list(db.user_progress.find({
        "user_email": user_email
    }))

    if not progress_data:
        return get_starter_recommendations()

    topic_frequency = {}
    solved = set()

    for p in progress_data:
        solved.add(p["question_id"])

        q = db.questions.find_one({"_id": p["question_id"]})
        if q:
            topic = q.get("topic", "General")
            topic_frequency[topic] = topic_frequency.get(topic, 0) + 1

    # Weak topic scoring
    weakness_score = {
        t: 1 / (c + 1)
        for t, c in topic_frequency.items()
    }

    weak_topic = max(weakness_score, key=weakness_score.get)

    # Get recommendations
    questions = list(db.questions.find({
        "topic": weak_topic,
        "_id": {"$nin": list(solved)}
    }).limit(10))

    return {
        "weak_topic": weak_topic,
        "recommendations": [
            {
                "id": str(q["_id"]),
                "title": q["title"],
                "difficulty": q["difficulty"],
                "topic": q["topic"]
            }
            for q in questions
        ]
    }