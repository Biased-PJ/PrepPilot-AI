from flask import Blueprint, request, jsonify, current_app
from config import db
import bcrypt
import jwt
import datetime

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

@auth.route('/login', methods=['POST'])
def login():

    data = request.json

    email = data.get('email')
    password = data.get('password')

    # Find user by email
    user = db.users.find_one({
        "email": email
    })

    # User not found
    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    stored_password = user['password']

    # Verify password
    password_match = bcrypt.checkpw(
        password.encode('utf-8'),
        stored_password.encode('utf-8')
    )

    # Wrong password
    if not password_match:
        return jsonify({
            "error": "Invalid password"
        }), 401

    token = jwt.encode({
    "email": user['email'],
    "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    },
    current_app.config['SECRET_KEY'],
    algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200