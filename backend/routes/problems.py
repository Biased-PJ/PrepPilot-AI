from flask import Blueprint, request, jsonify
from config import db
from middleware.auth_middleware import token_required
import pandas as pd
import numpy as np

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

        "status": data.get('status')
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