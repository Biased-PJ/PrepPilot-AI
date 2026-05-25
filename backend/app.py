from flask import Flask
from flask_cors import CORS
from config import db

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)