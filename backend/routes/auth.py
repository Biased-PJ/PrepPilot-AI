from flask import Blueprint, request, jsonify
from config import db
import bcrypt

auth = Blueprint('auth', __name__)

@auth.route('/signup', methods=['POST'])
def signup():

    data = request.json

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Check existing user
    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "error": "User already exists"
        }), 400

    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    # Store user
    db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({
        "message": "User created successfully"
    }), 201