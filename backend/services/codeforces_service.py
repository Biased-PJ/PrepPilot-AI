import requests
from datetime import datetime
from config import db

# =========================================================
# CONFIG
# =========================================================

CODEFORCES_API = (
    "https://codeforces.com/api"
)

PLATFORM = "codeforces"

HEADERS = {
    "User-Agent":
        (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
}

# =========================================================
# API CLIENT
# =========================================================

def codeforces_get(endpoint, params=None):

    try:

        response = requests.get(

            f"{CODEFORCES_API}/{endpoint}",

            params=params or {},

            headers=HEADERS,

            timeout=15
        )

        if response.status_code != 200:

            return {

                "success": False,

                "error":
                    f"HTTP {response.status_code}"
            }

        data = response.json()

        if data.get("status") != "OK":

            return {

                "success": False,

                "error":
                    data.get(
                        "comment",
                        "Codeforces API error"
                    )
            }

        return {

            "success": True,

            "data":
                data.get("result")
        }

    except Exception as e:

        return {

            "success": False,

            "error":
                str(e)
        }

# =========================================================
# START VERIFICATION
# =========================================================

def start_verification(

    user_email,
    handle
):

    if not handle:

        return {

            "success": False,

            "error":
                "handle required"
        }

    # =====================================================
    # CHECK USER EXISTS
    # =====================================================

    user_data = get_profile(handle)

    if not user_data["success"]:

        return user_data

    verification_text = (
        f"PrepPilot-{user_email}"
    )

    db.codeforces_verification.update_one(

        {
            "user_email":
                user_email
        },

        {
            "$set": {

                "user_email":
                    user_email,

                "handle":
                    handle,

                "verification_text":
                    verification_text,

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
            (
                "Add this text to your "
                "Codeforces first name "
                "or last name temporarily"
            ),

        "verification_text":
            verification_text
    }

# =========================================================
# VERIFY ACCOUNT
# =========================================================

def verify_account(user_email):

    record = db.codeforces_verification.find_one({

        "user_email":
            user_email
    })

    if not record:

        return {

            "success": False,

            "error":
                "Start verification first"
        }

    handle = record["handle"]

    verification_text = record[
        "verification_text"
    ]

    result = codeforces_get(

        "user.info",

        {
            "handles":
                handle
        }
    )

    if not result["success"]:

        return result

    try:

        user = result["data"][0]

    except:

        return {

            "success": False,

            "error":
                "User not found"
        }

    first_name = (
        user.get("firstName", "")
    )

    last_name = (
        user.get("lastName", "")
    )

    combined = (
        f"{first_name} {last_name}"
    )

    if verification_text in combined:

        db.codeforces_verification.update_one(

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
                "Codeforces verified successfully"
        }

    return {

        "success": False,

        "error":
            (
                "Verification text "
                "not found"
            )
    }

# =========================================================
# SYNC PROFILE
# =========================================================

def sync_profile(user_email):

    verification = db.codeforces_verification.find_one({

        "user_email":
            user_email,

        "verified":
            True
    })

    if not verification:

        return {

            "success": False,

            "error":
                "Codeforces not verified"
        }

    handle = verification["handle"]

    # =====================================================
    # FETCH DATA
    # =====================================================

    profile = get_profile(handle)

    rating = get_rating_history(handle)

    submissions = get_submissions(handle)

    problem_stats = get_problem_stats(
        submissions.get(
            "submissions",
            []
        )
    )

    if not profile["success"]:

        return profile

    # =====================================================
    # SAVE PROFILE
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
                    handle,

                # -----------------------------------------
                # PROFILE
                # -----------------------------------------

                "profile": {

                    "rank":

                        profile["profile"].get(
                            "rank"
                        ),

                    "max_rank":

                        profile["profile"].get(
                            "maxRank"
                        ),

                    "avatar":

                        profile["profile"].get(
                            "avatar"
                        ),

                    "title_photo":

                        profile["profile"].get(
                            "titlePhoto"
                        )
                },

                # -----------------------------------------
                # STATS
                # -----------------------------------------

                "stats": {

                    "rating":

                        profile["profile"].get(
                            "rating",
                            0
                        ),

                    "max_rating":

                        profile["profile"].get(
                            "maxRating",
                            0
                        ),

                    "contests":

                        rating.get(
                            "contest_count",
                            0
                        ),

                    "easy":

                        problem_stats["easy"],

                    "medium":

                        problem_stats["medium"],

                    "hard":

                        problem_stats["hard"],

                    "total":

                        problem_stats["total"]
                },

                # -----------------------------------------
                # METADATA
                # -----------------------------------------

                "metadata": {

                    "rating_history":

                        rating.get(
                            "history",
                            []
                        ),

                    "recent_submissions":

                        submissions.get(
                            "submissions",
                            []
                        )[:20]
                },

                "updated_at":
                    datetime.utcnow()
            }
        },

        upsert=True
    )

    return {

        "success": True,

        "message":
            "Codeforces synced successfully",

        "stats": {

            "rating":

                profile["profile"].get(
                    "rating",
                    0
                ),

            "max_rating":

                profile["profile"].get(
                    "maxRating",
                    0
                ),

            "total_solved":

                problem_stats["total"]
        }
    }

# =========================================================
# GET PROFILE
# =========================================================

def get_profile(handle):

    result = codeforces_get(

        "user.info",

        {
            "handles":
                handle
        }
    )

    if not result["success"]:

        return result

    try:

        profile = result["data"][0]

    except:

        return {

            "success": False,

            "error":
                "User not found"
        }

    return {

        "success": True,

        "profile":
            profile
    }

# =========================================================
# GET RATING HISTORY
# =========================================================

def get_rating_history(handle):

    result = codeforces_get(

        "user.rating",

        {
            "handle":
                handle
        }
    )

    if not result["success"]:

        return {

            "success": True,

            "contest_count": 0,

            "history": []
        }

    history = []

    for contest in result["data"]:

        history.append({

            "contest":

                contest.get(
                    "contestName"
                ),

            "rank":

                contest.get(
                    "rank"
                ),

            "old_rating":

                contest.get(
                    "oldRating"
                ),

            "new_rating":

                contest.get(
                    "newRating"
                ),

            "date":

                datetime.utcfromtimestamp(

                    contest.get(
                        "ratingUpdateTimeSeconds",
                        0
                    )

                ).isoformat()
        })

    return {

        "success": True,

        "contest_count":
            len(history),

        "history":
            history
    }

# =========================================================
# GET SUBMISSIONS
# =========================================================

def get_submissions(handle):

    result = codeforces_get(

        "user.status",

        {
            "handle":
                handle
        }
    )

    if not result["success"]:

        return {

            "success": True,

            "submissions": []
        }

    formatted = []

    for sub in result["data"]:

        problem = sub.get(
            "problem",
            {}
        )

        formatted.append({

            "contest_id":

                problem.get(
                    "contestId"
                ),

            "problem":

                problem.get(
                    "name"
                ),

            "rating":

                problem.get(
                    "rating"
                ),

            "tags":

                problem.get(
                    "tags",
                    []
                ),

            "verdict":

                sub.get(
                    "verdict"
                ),

            "language":

                sub.get(
                    "programmingLanguage"
                ),

            "timestamp":

                datetime.utcfromtimestamp(

                    sub.get(
                        "creationTimeSeconds",
                        0
                    )

                ).isoformat()
        })

    return {

        "success": True,

        "submissions":
            formatted
    }

# =========================================================
# PROBLEM STATS
# =========================================================

def get_problem_stats(submissions):

    solved = set()

    easy = 0
    medium = 0
    hard = 0

    for sub in submissions:

        if sub.get("verdict") != "OK":
            continue

        problem = sub.get("problem")

        if not problem:
            continue

        if problem in solved:
            continue

        solved.add(problem)

        rating = sub.get("rating")

        # =================================================
        # RATING CLASSIFICATION
        # =================================================

        if rating is None:

            easy += 1

        elif rating < 1200:

            easy += 1

        elif rating < 1800:

            medium += 1

        else:

            hard += 1

    return {

        "easy":
            easy,

        "medium":
            medium,

        "hard":
            hard,

        "total":
            easy + medium + hard
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

    db.codeforces_verification.delete_many({

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
            "Codeforces account removed"
    }