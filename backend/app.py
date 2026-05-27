from flask import Flask, jsonify, request
from flask_cors import CORS
import os

from config import db
from routes.auth import auth
from middleware.auth_middleware import token_required
from routes.problems import problems

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

CORS(app)

app.register_blueprint(auth)
app.register_blueprint(problems)


@app.route('/')
def home():
    return {"message": "PrepPilot AI Backend Running"}


@app.route('/test-db')
def test_db():
    db.users.insert_one({"name": "test_user"})
    return {"message": "MongoDB Connected"}


@app.route('/profile')
@token_required
def profile():
    return jsonify({
        "message": "Protected profile accessed",
        "user": request.user
    })


if __name__ == '__main__':
    app.run(debug=True)