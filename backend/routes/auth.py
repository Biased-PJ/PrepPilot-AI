from flask import Blueprint, request, jsonify, current_app
from config import db
import bcrypt
import jwt
import datetime
from config import JWT_SECRET_KEY

auth = Blueprint('auth', __name__)


@auth.route('/signup', methods=['POST'])
def signup():
    data = request.json

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Basic validation
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Check existing user
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User created successfully"}), 201


@auth.route('/login', methods=['POST'])
def login():
    data = request.json

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = db.users.find_one({"email": email})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.checkpw(
        password.encode('utf-8'),
        user['password'].encode('utf-8')
    ):
        return jsonify({"error": "Invalid password"}), 401

    token = jwt.encode(
        {
            "email": user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
        },
        JWT_SECRET_KEY,
        algorithm="HS256"
    )

    # Fix for PyJWT versions returning bytes
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200