from flask import Flask
from flask_cors import CORS
import os

from routes.auth import auth
from routes.problems import problems
from routes.analytics import analytics
from routes.recommendations import recommendations
from routes.leaderboard import leaderboard

from routes.leetcode import leetcode
from routes.codeforces import codeforces
from routes.codechef import codechef

from middleware.error_middleware import register_error_handlers
from middleware.request_logger import register_request_logger

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "preppilot_secret"
)

# Explicitly configure CORS to allow preflight OPTIONS requests across all prefixes
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://prep-pilot-ai-eta.vercel.app",
            "https://prep-pilot-ai.vercel.app",
            "http://localhost:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.register_blueprint(auth)
app.register_blueprint(problems, url_prefix="/problems")
app.register_blueprint(analytics, url_prefix="/analytics")
app.register_blueprint(recommendations, url_prefix="/recommendations")
app.register_blueprint(leaderboard, url_prefix="/leaderboard")

app.register_blueprint(leetcode, url_prefix="/platforms/leetcode")
app.register_blueprint(codeforces, url_prefix="/platforms/codeforces")
app.register_blueprint(codechef, url_prefix="/platforms/codechef")

register_error_handlers(app)
register_request_logger(app)


@app.route("/")
def home():
    return {
        "success": True,
        "message": "PrepPilot AI Backend Running",
    }


@app.route("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )