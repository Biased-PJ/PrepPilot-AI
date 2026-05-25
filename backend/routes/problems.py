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