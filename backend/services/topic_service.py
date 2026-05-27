from config import db


def get_topic_progress(user_email):

    progress_data = list(db.user_progress.find({
        "user_email": user_email
    }))

    stats = {}

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if not question:
            continue

        topic = question.get("topic", "General")

        stats[topic] = stats.get(topic, 0) + 1

    return {
        "topics_solved": stats
    }