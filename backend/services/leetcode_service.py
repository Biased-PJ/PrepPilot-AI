import requests
import uuid
from datetime import datetime

from config import db

# =========================================================
# CONFIG
# =========================================================

LEETCODE_GRAPHQL_URL = (
    "https://leetcode.com/graphql"
)

HEADERS = {

    "Content-Type":
        "application/json",

    "User-Agent":
        (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),

    "Referer":
        "https://leetcode.com",

    "Origin":
        "https://leetcode.com"
}

PLATFORM = "leetcode"

# =========================================================
# GRAPHQL QUERIES
# =========================================================

GET_PROFILE_QUERY = """

query userPublicProfile($username: String!) {

    matchedUser(username: $username) {

        username

        profile {

            realName

            aboutMe

            ranking

            reputation

            starRating

            userAvatar
        }
    }
}

"""

GET_STATS_QUERY = """

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

GET_CALENDAR_QUERY = """

query userCalendar($username: String!) {

    matchedUser(username: $username) {

        submissionCalendar
    }
}

"""

GET_RECENT_SUBMISSIONS = """

query recentSubmissions($username: String!) {

    recentSubmissionList(username: $username) {

        title

        titleSlug

        timestamp

        statusDisplay

        lang
    }
}

"""

# =========================================================
# GRAPHQL CLIENT
# =========================================================

def leetcode_graphql(

    query,
    variables=None
):

    try:

        response = requests.post(

            LEETCODE_GRAPHQL_URL,

            json={

                "query":
                    query,

                "variables":
                    variables or {}
            },

            headers=HEADERS,

            timeout=15
        )

        if response.status_code != 200:

            return {

                "success": False,

                "error":
                    f"HTTP {response.status_code}"
            }

        return {

            "success": True,

            "data":
                response.json()
        }

    except Exception as e:

        return {

            "success": False,

            "error":
                str(e)
        }

# =========================================================
# VERIFICATION CODE
# =========================================================

def generate_verification_code():

    return str(
        uuid.uuid4()
    )[:8]

# =========================================================
# START VERIFICATION
# =========================================================

def start_verification(

    user_email,
    username
):

    if not username:

        return {

            "success": False,

            "error":
                "username required"
        }

    # =====================================================
    # CHECK USER EXISTS
    # =====================================================

    profile = get_profile(username)

    if not profile["success"]:

        return profile

    # =====================================================
    # GENERATE CODE
    # =====================================================

    code = generate_verification_code()

    verification_code = (
        f"PrepPilot-VERIFY-{code}"
    )

    # =====================================================
    # SAVE
    # =====================================================

    db.leetcode_verification.update_one(

        {
            "user_email":
                user_email
        },

        {
            "$set": {

                "user_email":
                    user_email,

                "username":
                    username,

                "platform":
                    PLATFORM,

                "code":
                    code,

                "verified":
                    False,

                "updated_at":
                    datetime.utcnow()
            }
        },

        upsert=True
    )

    return {

        "success": True,

        "message":
            "Add this code to your LeetCode bio",

        "verification_code":
            verification_code
    }

# =========================================================
# VERIFY ACCOUNT
# =========================================================

def verify_account(user_email):

    record = db.leetcode_verification.find_one({

        "user_email":
            user_email
    })

    if not record:

        return {

            "success": False,

            "error":
                "Start verification first"
        }

    username = record["username"]

    code = record["code"]

    # =====================================================
    # FETCH PROFILE
    # =====================================================

    result = leetcode_graphql(

        GET_PROFILE_QUERY,

        {
            "username":
                username
        }
    )

    if not result["success"]:

        return result

    try:

        profile = (

            result["data"]
            ["data"]
            ["matchedUser"]
            ["profile"]
        )

    except:

        return {

            "success": False,

            "error":
                "LeetCode user not found"
        }

    about_me = profile.get(
        "aboutMe",
        ""
    )

    verification_string = (
        f"PrepPilot-VERIFY-{code}"
    )

    # =====================================================
    # VERIFY
    # =====================================================

    if verification_string in about_me:

        db.leetcode_verification.update_one(

            {
                "user_email":
                    user_email
            },

            {
                "$set": {

                    "verified":
                        True,

                    "verified_at":
                        datetime.utcnow()
                }
            }
        )

        return {

            "success": True,

            "message":
                "LeetCode verified successfully"
        }

    return {

        "success": False,

        "error":
            "Verification code not found in bio"
    }

# =========================================================
# SYNC PROFILE
# =========================================================

def sync_profile(user_email):

    verification = db.leetcode_verification.find_one({

        "user_email":
            user_email,

        "verified":
            True
    })

    if not verification:

        return {

            "success": False,

            "error":
                "LeetCode account not verified"
        }

    username = verification["username"]

    # =====================================================
    # FETCH PROFILE
    # =====================================================

    profile_data = get_profile(username)

    stats_data = get_stats(username)

    calendar_data = get_calendar(username)

    submissions_data = get_recent_submissions(
        username
    )

    if not profile_data["success"]:

        return profile_data

    if not stats_data["success"]:

        return stats_data

    # =====================================================
    # EXTRACT PROFILE
    # =====================================================

    profile = profile_data["profile"]

    stats = stats_data["stats"]

    # =====================================================
    # STORE
    # =====================================================

    db.platform_profiles.update_one(

        {

            "user_email":
                user_email,

            "platform":
                PLATFORM
        },

        {
            "$set": {

                "user_email":
                    user_email,

                "platform":
                    PLATFORM,

                "username":
                    username,

                # -----------------------------------------
                # PROFILE
                # -----------------------------------------

                "profile": {

                    "real_name":

                        profile.get(
                            "realName"
                        ),

                    "ranking":

                        profile.get(
                            "ranking"
                        ),

                    "reputation":

                        profile.get(
                            "reputation"
                        ),

                    "star_rating":

                        profile.get(
                            "starRating"
                        ),

                    "avatar":

                        profile.get(
                            "userAvatar"
                        )
                },

                # -----------------------------------------
                # STATS
                # -----------------------------------------

                "stats":
                    stats,

                # -----------------------------------------
                # METADATA
                # -----------------------------------------

                "metadata": {

                    "calendar":

                        calendar_data.get(
                            "calendar",
                            {}
                        ),

                    "recent_submissions":

                        submissions_data.get(
                            "submissions",
                            []
                        )
                },

                # -----------------------------------------
                # TIMESTAMPS
                # -----------------------------------------

                "updated_at":
                    datetime.utcnow()
            }
        },

        upsert=True
    )

    return {

        "success": True,

        "message":
            "LeetCode synced successfully",

        "stats":
            stats
    }

# =========================================================
# GET PROFILE
# =========================================================

def get_profile(username):

    result = leetcode_graphql(

        GET_PROFILE_QUERY,

        {
            "username":
                username
        }
    )

    if not result["success"]:

        return result

    try:

        matched_user = (

            result["data"]
            ["data"]
            ["matchedUser"]
        )

    except:

        return {

            "success": False,

            "error":
                "User not found"
        }

    if not matched_user:

        return {

            "success": False,

            "error":
                "User not found"
        }

    return {

        "success": True,

        "profile":

            matched_user.get(
                "profile",
                {}
            )
    }

# =========================================================
# GET STATS
# =========================================================

def get_stats(username):

    result = leetcode_graphql(

        GET_STATS_QUERY,

        {
            "username":
                username
        }
    )

    if not result["success"]:

        return result

    try:

        stats_data = (

            result["data"]
            ["data"]
            ["matchedUser"]
            ["submitStats"]
            ["acSubmissionNum"]
        )

    except:

        return {

            "success": False,

            "error":
                "Stats fetch failed"
        }

    easy = 0
    medium = 0
    hard = 0

    for item in stats_data:

        difficulty = item.get(
            "difficulty"
        )

        count = item.get(
            "count",
            0
        )

        if difficulty == "Easy":

            easy = count

        elif difficulty == "Medium":

            medium = count

        elif difficulty == "Hard":

            hard = count

    total = easy + medium + hard

    return {

        "success": True,

        "stats": {

            "easy":
                easy,

            "medium":
                medium,

            "hard":
                hard,

            "total":
                total
        }
    }

# =========================================================
# GET CALENDAR
# =========================================================

def get_calendar(username):

    result = leetcode_graphql(

        GET_CALENDAR_QUERY,

        {
            "username":
                username
        }
    )

    if not result["success"]:

        return result

    try:

        calendar = (

            result["data"]
            ["data"]
            ["matchedUser"]
            ["submissionCalendar"]
        )

    except:

        calendar = {}

    return {

        "success": True,

        "calendar":
            calendar
    }

# =========================================================
# GET RECENT SUBMISSIONS
# =========================================================

def get_recent_submissions(username):

    result = leetcode_graphql(

        GET_RECENT_SUBMISSIONS,

        {
            "username":
                username
        }
    )

    if not result["success"]:

        return result

    try:

        submissions = (

            result["data"]
            ["data"]
            ["recentSubmissionList"]
        )

    except:

        submissions = []

    formatted = []

    for submission in submissions:

        formatted.append({

            "title":
                submission.get(
                    "title"
                ),

            "slug":
                submission.get(
                    "titleSlug"
                ),

            "status":
                submission.get(
                    "statusDisplay"
                ),

            "language":
                submission.get(
                    "lang"
                ),

            "timestamp":
                submission.get(
                    "timestamp"
                )
        })

    return {

        "success": True,

        "submissions":
            formatted
    }

# =========================================================
# GET SAVED PROFILE
# =========================================================

def get_saved_profile(user_email):

    profile = db.platform_profiles.find_one({

        "user_email":
            user_email,

        "platform":
            PLATFORM
    })

    if not profile:

        return {

            "success": False,

            "error":
                "No synced profile found"
        }

    profile["_id"] = str(
        profile["_id"]
    )

    return {

        "success": True,

        "profile":
            profile
    }

# =========================================================
# REMOVE ACCOUNT
# =========================================================

def remove_account(user_email):

    db.leetcode_verification.delete_many({

        "user_email":
            user_email
    })

    db.platform_profiles.delete_many({

        "user_email":
            user_email,

        "platform":
            PLATFORM
    })

    return {

        "success": True,

        "message":
            "LeetCode account removed"
    }