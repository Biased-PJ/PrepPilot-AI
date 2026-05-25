from flask import Blueprint, request, jsonify
from config import db
from middleware.auth_middleware import token_required

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