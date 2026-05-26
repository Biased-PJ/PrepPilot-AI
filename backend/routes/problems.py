from flask import Blueprint, request, jsonify
from config import db
from middleware.auth_middleware import token_required
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import math
from math import ceil

problems = Blueprint('problems', __name__)

@problems.route('/add-problem', methods=['POST'])
@token_required
def add_problem():

    data = request.json

    problem = {

        "user_email": request.user['email'],

        "title": data.get('title'),

        "topic": data.get('topic'),

        "difficulty": data.get('difficulty'),

        "platform": data.get('platform'),

        "time_taken": data.get('time_taken'),

        "status": data.get('status'),

        "solved_at": datetime.utcnow()
    }

    db.problems.insert_one(problem)

    return jsonify({
        "message": "Problem added successfully"
    }), 201

@problems.route('/my-problems', methods=['GET'])
@token_required
def get_my_problems():

    user_email = request.user['email']

    problems_list = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    return jsonify(problems_list), 200

@problems.route('/analytics', methods=['GET'])
@token_required
def analytics():

    user_email = request.user['email']

    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    # No problems found
    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Convert to DataFrame
    df = pd.DataFrame(problems_data)

    # Total problems
    total_problems = len(df)

    # Average solving time
    average_time = np.mean(df['time_taken'])

    # Topic distribution
    topic_distribution = (
        df['topic']
        .value_counts()
        .to_dict()
    )

    # Difficulty distribution
    difficulty_distribution = (
        df['difficulty']
        .value_counts()
        .to_dict()
    )

    # Weak topic
    weak_topic = min(
        topic_distribution,
        key=topic_distribution.get
    )

    return jsonify({

        "total_problems": total_problems,

        "average_time": round(float(average_time), 2),

        "topic_distribution": topic_distribution,

        "difficulty_distribution": difficulty_distribution,

        "weak_topic": weak_topic

    }), 200

@problems.route('/generate-chart', methods=['GET'])
@token_required
def generate_chart():

    user_email = request.user['email']

    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Create DataFrame
    df = pd.DataFrame(problems_data)

    # Topic counts
    topic_counts = df['topic'].value_counts()

    # Create chart
    plt.figure(figsize=(8, 5))

    topic_counts.plot(kind='bar')

    plt.title('Topic Distribution')

    plt.xlabel('Topics')

    plt.ylabel('Problems Solved')

    # Save chart
    safe_email = user_email.replace("@", "_").replace(".", "_")

    import os

    static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
    static_dir = os.path.abspath(static_dir)

    os.makedirs(static_dir, exist_ok=True)

    chart_path = os.path.join(static_dir, f"{safe_email}_topic_chart.png")

    plt.savefig(chart_path)

    plt.close()

    return jsonify({
        "message": "Chart generated successfully",
        "chart_path": chart_path
    }), 200

@problems.route('/dashboard', methods=['GET'])
@token_required
def dashboard():

    user_email = request.user['email']

    # Fetch user problems
    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Convert to DataFrame
    df = pd.DataFrame(problems_data)

    # Analytics
    total_problems = len(df)

    average_time = round(
        float(np.mean(df['time_taken'])),
        2
    )

    topic_distribution = (
        df['topic']
        .value_counts()
        .to_dict()
    )

    difficulty_distribution = (
        df['difficulty']
        .value_counts()
        .to_dict()
    )

    weak_topic = min(
        topic_distribution,
        key=topic_distribution.get
    )

    # Recent problems
    recent_problems = problems_data[-5:]

    # Safe chart path
    safe_email = (
        user_email
        .replace("@", "_")
        .replace(".", "_")
    )

    chart_path = f"static/{safe_email}_topic_chart.png"

    return jsonify({

        "user": user_email,

        "total_problems": total_problems,

        "average_time": average_time,

        "weak_topic": weak_topic,

        "topic_distribution": topic_distribution,

        "difficulty_distribution": difficulty_distribution,

        "recent_problems": recent_problems,

        "chart_path": chart_path

    }), 200

@problems.route('/recommendations', methods=['GET'])
@token_required
def recommendations():

    user_email = request.user['email']

    # Fetch user problems
    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Create DataFrame
    df = pd.DataFrame(problems_data)

    # Topic distribution
    topic_distribution = (
        df['topic']
        .value_counts()
        .to_dict()
    )

    # Weak topic
    weak_topic = min(
        topic_distribution,
        key=topic_distribution.get
    )

    # Difficulty distribution
    difficulty_distribution = (
        df['difficulty']
        .value_counts()
        .to_dict()
    )

    # Determine next difficulty
    recommended_difficulty = "Easy"

    if difficulty_distribution.get("Easy", 0) >= 5:
        recommended_difficulty = "Medium"

    if difficulty_distribution.get("Medium", 0) >= 5:
        recommended_difficulty = "Hard"

    # Average solving time
    average_time = np.mean(df['time_taken'])

    # Generate recommendation message
    if average_time > 45:

        message = (
            "Your solving time is high. "
            "Practice easier problems to improve speed."
        )

    else:

        message = (
            f"You should practice more "
            f"{weak_topic} problems."
        )

    return jsonify({

        "weak_topic": weak_topic,

        "recommended_topic": weak_topic,

        "recommended_difficulty": recommended_difficulty,

        "average_solving_time": round(float(average_time), 2),

        "message": message

    }), 200

@problems.route('/streak', methods=['GET'])
@token_required
def streak():

    user_email = request.user['email']

    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            }
        )
    )

    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Extract solve dates
    solve_dates = []

    for problem in problems_data:

        if 'solved_at' in problem:

            solve_dates.append(
                problem['solved_at'].date()
            )

    # Remove duplicates
    unique_dates = sorted(
        list(set(solve_dates))
    )

    if len(unique_dates) == 0:

        return jsonify({
            "message": "No timestamped problems found"
        }), 404

    # Calculate streak
    current_streak = 1

    for i in range(
        len(unique_dates) - 1,
        0,
        -1
    ):

        diff = (
            unique_dates[i]
            - unique_dates[i - 1]
        ).days

        if diff == 1:
            current_streak += 1

        else:
            break

    # Consistency score
    total_active_days = len(unique_dates)

    first_day = unique_dates[0]

    last_day = unique_dates[-1]

    total_days = (
        last_day - first_day
    ).days + 1

    consistency_percentage = round(
        (total_active_days / total_days) * 100,
        2
    )

    return jsonify({

        "current_streak": current_streak,

        "active_days": total_active_days,

        "consistency_percentage":
            consistency_percentage

    }), 200

@problems.route('/readiness-score', methods=['GET'])
@token_required
def readiness_score():

    user_email = request.user['email']

    problems_data = list(
        db.problems.find(
            {
                "user_email": user_email
            },
            {
                "_id": 0
            }
        )
    )

    if len(problems_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    # Create DataFrame
    df = pd.DataFrame(problems_data)

    # -------------------------
    # 1. Problem Count Score
    # -------------------------

    total_problems = len(df)

    problem_score = min(
        math.ceil((total_problems / 400) * 30),
        30
    )

    # -------------------------
    # 2. Difficulty Score
    # -------------------------

    difficulty_distribution = (
        df['difficulty']
        .value_counts()
        .to_dict()
    )

    medium_count = (
        difficulty_distribution.get("Medium", 0)
    )

    hard_count = (
        difficulty_distribution.get("Hard", 0)
    )

    difficulty_score = min(
        math.ceil((medium_count * 0.2)
        + (hard_count * 0.3)),
        30
    )

    # -------------------------
    # 3. Topic Coverage Score
    # -------------------------

    unique_topics = (
        df['topic']
        .nunique()
    )

    topic_score = math.ceil(min(
        unique_topics / 2,
        30
    ))

    # -------------------------
    # 4. Consistency Score
    # -------------------------

    consistency_score = 0

    solve_dates = []

    for problem in problems_data:

        if 'solved_at' in problem:

            solve_dates.append(
                problem['solved_at'].date()
            )

    if len(solve_dates) > 0:

        unique_dates = sorted(
            list(set(solve_dates))
        )

        total_active_days = len(unique_dates)

        first_day = unique_dates[0]

        last_day = unique_dates[-1]

        total_days = (
            last_day - first_day
        ).days + 1

        consistency_percentage = (
            total_active_days / total_days
        ) * 100

        if (
          total_problems > 100
        ):
            consistency_score = math.ceil(min(
                consistency_percentage / 10, 10
            ))

        else:
            consistency_score = math.ceil(consistency_percentage / 10)

    # -------------------------
    # Final Score
    # -------------------------

    final_score = math.ceil(
        problem_score
        + difficulty_score
        + topic_score
        + consistency_score
    )

    # Readiness level
    readiness_level = "Beginner"

    if final_score >= 40:
        readiness_level = "Intermediate"

    if final_score >= 70:
        readiness_level = "Interview Ready"

    return jsonify({

        "interview_readiness_score":
            final_score,

        "readiness_level":
            readiness_level,

        "breakdown": {

            "problem_score":
                math.ceil(problem_score),

            "difficulty_score":
                math.ceil(difficulty_score),

            "topic_score":
                math.ceil(topic_score),

            "consistency_score":
                math.ceil(consistency_score)
        }

    }), 200

@problems.route('/add-company-question', methods=['POST'])
@token_required
def add_company_question():

    data = request.json

    question = {

        "company": data.get('company'),

        "title": data.get('title'),

        "topic": data.get('topic'),

        "difficulty": data.get('difficulty'),

        "platform": data.get('platform'),

        "link": data.get('link')
    }

    db.company_questions.insert_one(question)

    return jsonify({
        "message": "Company question added successfully"
    }), 201

@problems.route(
    '/company-questions/<company>',
    methods=['GET']
)
@token_required
def get_company_questions(company):

    questions = list(

        db.company_questions.find(

            {
                "company": {
                    "$regex": f"^{company}$",
                    "$options": "i"
                }
            },

            {
                "_id": 0
            }
        )
    )

    return jsonify(questions), 200