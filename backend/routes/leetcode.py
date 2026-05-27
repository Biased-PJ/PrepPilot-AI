import requests
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify

from config import db
from middleware.auth_middleware import token_required

leetcode = Blueprint("leetcode", __name__)

# =====================================================
# CONFIG
# =====================================================

LEETCODE_URL = "https://leetcode.com/graphql"

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://leetcode.com"
}

PLATFORM = "leetcode"

# =====================================================
# GRAPHQL CLIENT
# =====================================================

def leetcode_graphql(query, variables=None):
    try:
        response = requests.post(
            LEETCODE_URL,
            json={
                "query": query,
                "variables": variables or {}
            },
            headers=HEADERS,
            timeout=10
        )

        return response.json()

    except Exception as e:
        return {"error": str(e)}

# =====================================================
# VERIFICATION CODE GENERATOR
# =====================================================

def generate_verification_code():
    return str(uuid.uuid4())[:8]

# =====================================================
# GRAPHQL QUERIES
# =====================================================

GET_PROFILE = """
query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    profile {
      aboutMe
    }
  }
}
"""

GET_STATS = """
query userProfile($username: String!) {
  matchedUser(username: $username) {
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
"""

GET_CALENDAR = """
query userProfile($username: String!) {
  matchedUser(username: $username) {
    submissionCalendar
  }
}
"""

# =====================================================
# START VERIFICATION
# =====================================================

@leetcode.route("/leetcode/start-verification", methods=["POST"])
@token_required
def start_verification():

    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "username required"}), 400

    code = generate_verification_code()

    db.leetcode_verification.update_one(
        {"user_email": request.user["email"]},
        {
            "$set": {
                "username": username,
                "code": code,
                "verified": False,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    return jsonify({
        "message": "Add this code in your LeetCode profile bio",
        "verification_code": f"PrepPilot-VERIFY-{code}"
    }), 200

# =====================================================
# VERIFY ACCOUNT
# =====================================================

@leetcode.route("/leetcode/verify", methods=["POST"])
@token_required
def verify_account():

    user_email = request.user["email"]

    record = db.leetcode_verification.find_one({
        "user_email": user_email
    })

    if not record:
        return jsonify({"error": "Start verification first"}), 400

    username = record["username"]
    code = record["code"]

    data = leetcode_graphql(GET_PROFILE, {
        "username": username
    })

    try:
        about_me = (
            data["data"]["matchedUser"]["profile"]["aboutMe"]
            or ""
        )
    except:
        return jsonify({"error": "User not found"}), 404

    if f"PrepPilot-VERIFY-{code}" in about_me:

        db.leetcode_verification.update_one(
            {"user_email": user_email},
            {
                "$set": {
                    "verified": True,
                    "verified_at": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "message": "LeetCode account verified successfully"
        }), 200

    return jsonify({
        "error": "Verification code not found in profile"
    }), 401

# =====================================================
# SYNC LEETCODE DATA (NORMALIZED INTO PLATFORM PROFILES)
# =====================================================

@leetcode.route("/leetcode/sync", methods=["POST"])
@token_required
def sync_leetcode():

    user_email = request.user["email"]

    record = db.leetcode_verification.find_one({
        "user_email": user_email,
        "verified": True
    })

    if not record:
        return jsonify({"error": "LeetCode not verified"}), 400

    username = record["username"]

    # ---------------- FETCH STATS ----------------
    stats_response = leetcode_graphql(GET_STATS, {
        "username": username
    })

    if "errors" in stats_response:
        return jsonify({"error": "LeetCode stats fetch failed"}), 500

    try:
        stats = stats_response["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
    except:
        return jsonify({"error": "Invalid LeetCode response"}), 500

    easy = medium = hard = 0

    for item in stats:
        if item["difficulty"] == "Easy":
            easy = item["count"]
        elif item["difficulty"] == "Medium":
            medium = item["count"]
        elif item["difficulty"] == "Hard":
            hard = item["count"]

    total = easy + medium + hard

    # ---------------- FETCH CALENDAR ----------------
    calendar_response = leetcode_graphql(GET_CALENDAR, {
        "username": username
    })

    calendar = {}

    try:
        calendar = (
            calendar_response
            .get("data", {})
            .get("matchedUser", {})
            .get("submissionCalendar", {})
        )
    except:
        calendar = {}

    # =====================================================
    # STORE IN UNIFIED COLLECTION
    # =====================================================

    db.platform_profiles.update_one(
        {
            "user_email": user_email,
            "platform": PLATFORM
        },
        {
            "$set": {
                "user_email": user_email,
                "platform": PLATFORM,
                "username": username,

                "stats": {
                    "easy": easy,
                    "medium": medium,
                    "hard": hard,
                    "total": total
                },

                "metadata": {
                    "calendar": calendar
                },

                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    return jsonify({
        "message": "LeetCode synced successfully",
        "platform": PLATFORM,
        "stats": {
            "easy": easy,
            "medium": medium,
            "hard": hard,
            "total": total
        }
    }), 200

# =====================================================
# GET LEETCODE PROFILE (OPTIONAL DEBUG ENDPOINT)
# =====================================================

@leetcode.route("/leetcode/profile", methods=["GET"])
@token_required
def get_leetcode_profile():

    user_email = request.user["email"]

    data = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": PLATFORM
    })

    if not data:
        return jsonify({"error": "No LeetCode data found"}), 404

    data["_id"] = str(data["_id"])

    return jsonify(data), 200