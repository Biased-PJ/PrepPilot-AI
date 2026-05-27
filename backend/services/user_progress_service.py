from config import db
from bson import ObjectId


def get_my_problems(user_email):

    progress_data = list(db.user_progress.find({
        "user_email": user_email
    }))

    results = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if question:

            results.append({
                "question_id": str(question["_id"]),
                "title": question["title"],
                "topic": question["topic"],
                "difficulty": question["difficulty"],
                "platform": question["platform"],
                "companies": question.get("companies", []),
                "status": progress.get("status"),
                "time_taken": progress.get("time_taken"),
                "solved_at": progress.get("solved_at")
            })

    return {
        "total_solved": len(results),
        "problems": results
    }