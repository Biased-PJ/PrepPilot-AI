from flask import Flask, jsonify, request, current_app
from flask_cors import CORS
from config import db
from routes.auth import auth
from middleware.auth_middleware import token_required

app = Flask(__name__)
app.config['SECRET_KEY'] = 'preppilot_super_secret'
CORS(app)

app.register_blueprint(auth)

@app.route('/')
def home():
    return {
        "message": "PrepPilot AI Backend Running"
    }

@app.route('/test-db')
def test_db():

    db.users.insert_one({
        "name": "test_user"
    })

    return {
        "message": "MongoDB Connected"
    }

@app.route('/profile')
@token_required
def profile():

    return jsonify({
        "message": "Protected profile accessed",
        "user": request.user
    })

if __name__ == '__main__':
    app.run(debug=True)