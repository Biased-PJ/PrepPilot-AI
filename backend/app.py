from flask import Flask
from flask_cors import CORS
import os

# =========================================================
# ROUTES
# =========================================================

from routes.auth import auth
from routes.problems import problems

from routes.leetcode import leetcode
from routes.codeforces import codeforces
from routes.codechef import codechef

# =========================================================
# MIDDLEWARE
# =========================================================

from middleware.error_middleware import (
    register_error_handlers
)

from middleware.request_logger import (
    register_request_logger
)

# =========================================================
# CREATE FLASK APP
# =========================================================

app = Flask(__name__)

# =========================================================
# CONFIGURATION
# =========================================================

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "preppilot_secret"
)

# =========================================================
# ENABLE CORS
# =========================================================

CORS(app)

# =========================================================
# REGISTER BLUEPRINTS
# =========================================================

# 1. REMOVED url_prefix ENTIRELY: Now routes like /signup and /login are at the root level
app.register_blueprint(auth)

# 2. CLEANED UP OTHER BLUEPRINTS: Removed "/api" to match your frontend api.ts setup
app.register_blueprint(problems, url_prefix="/problems")

app.register_blueprint(leetcode, url_prefix="/platforms/leetcode")

app.register_blueprint(codeforces, url_prefix="/platforms/codeforces")

app.register_blueprint(codechef, url_prefix="/platforms/codechef")

# =========================================================
# REGISTER MIDDLEWARE
# =========================================================

register_error_handlers(app)

register_request_logger(app)

# =========================================================
# ROOT ROUTE
# =========================================================

@app.route("/")
def home():

    return {

        "success": True,

        "message":
            "PrepPilot AI Backend Running"
    }

# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health")
def health_check():

    return {

        "success": True,

        "status": "healthy"
    }

# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True
    )