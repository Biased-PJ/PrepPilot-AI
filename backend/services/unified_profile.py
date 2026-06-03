from config import db
from datetime import datetime

# =========================================================
# SUPPORTED PLATFORMS
# =========================================================

SUPPORTED_PLATFORMS = [
    "leetcode",
    "codeforces",
    "codechef",
    "github"
]

# =========================================================
# GET ALL PLATFORM PROFILES
# =========================================================

def get_platform_profiles(user_email):
    profiles = list(
        db.platform_profiles.find({
            "user_email": user_email
        })
    )

    serialized = []
    for profile in profiles:
        serialized.append(
            serialize_profile(profile)
        )

    return serialized

# =========================================================
# GET SINGLE PLATFORM PROFILE
# =========================================================

def get_platform_profile(user_email, platform):
    profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": platform.lower()
    })

    if not profile:
        return None

    return serialize_profile(profile)

# =========================================================
# GET UNIFIED STATS
# =========================================================

def get_unified_stats(user_email):
    profiles = list(
        db.platform_profiles.find({
            "user_email": user_email
        })
    )

    # =====================================================
    # INITIALIZE
    # =====================================================
    unified = {
        # ---------------------------------------------
        # Problem Counts (Primarily LeetCode specific split)
        # ---------------------------------------------
        "easy": 0,
        "medium": 0,
        "hard": 0,
        "total": 0,

        # ---------------------------------------------
        # Ratings
        # ---------------------------------------------
        "codeforces_rating": 0,
        "codeforces_max_rating": 0,
        "codechef_rating": 0,

        # ---------------------------------------------
        # GitHub
        # ---------------------------------------------
        "github_repos": 0,
        "github_followers": 0,
        "github_stars": 0,

        # ---------------------------------------------
        # Contest Stats
        # ---------------------------------------------
        "contests": 0,

        # ---------------------------------------------
        # Platform Count
        # ---------------------------------------------
        "connected_platforms": 0,

        # ---------------------------------------------
        # Platforms
        # ---------------------------------------------
        "platforms": []
    }

    # =====================================================
    # PROCESS PROFILES
    # =====================================================
    for profile in profiles:
        platform = profile.get("platform", "").lower()
        stats = profile.get("stats", {})

        unified["connected_platforms"] += 1
        unified["platforms"].append(platform)

        # =================================================
        # LEETCODE
        # =================================================
        if platform == "leetcode":
            unified["easy"] += stats.get("easy", 0)
            unified["medium"] += stats.get("medium", 0)
            unified["hard"] += stats.get("hard", 0)
            unified["total"] += stats.get("total", 0)

        # =================================================
        # CODEFORCES (Straight +1 mapping per problem)
        # =================================================
        elif platform == "codeforces":
            unified["codeforces_rating"] = max(
                unified["codeforces_rating"],
                stats.get("rating", 0)
            )
            unified["codeforces_max_rating"] = max(
                unified["codeforces_max_rating"],
                stats.get("max_rating", 0)
            )
            unified["contests"] += stats.get("contests", 0)
            unified["total"] += stats.get("solved", 0)

        # =================================================
        # CODECHEF
        # =================================================
        elif platform == "codechef":
            unified["codechef_rating"] = max(
                unified["codechef_rating"],
                stats.get("rating", 0)
            )
            unified["contests"] += stats.get("contests", 0)
            unified["total"] += stats.get("solved", 0)

        # =================================================
        # GITHUB
        # =================================================
        elif platform == "github":
            unified["github_repos"] += stats.get("repos", 0)
            unified["github_followers"] += stats.get("followers", 0)
            unified["github_stars"] += stats.get("stars", 0)

    # =====================================================
    # OVERALL CODER SCORE
    # =====================================================
    unified["coder_score"] = calculate_coder_score(unified)

    # =====================================================
    # LEVEL
    # =====================================================
    unified["level"] = determine_level(unified["coder_score"])

    return unified

# =========================================================
# CODER SCORE
# =========================================================
def calculate_coder_score(stats):
    # DSA Score from LeetCode breakdown
    dsa_score = (
        stats["easy"] * 1 +
        stats["medium"] * 2 +
        stats["hard"] * 5
    )

    # Codeforces contribution determined directly by rating
    cf_score = (
        stats["codeforces_rating"] * 0.05
    )

    # CodeChef contribution determined directly by rating
    cc_score = (
        stats["codechef_rating"] * 0.03
    )

    # GitHub contributions
    github_score = (
        stats["github_repos"] * 2 +
        stats["github_followers"] * 1.5 +
        stats["github_stars"] * 0.5
    )

    # Combined Contest participations
    contest_score = (
        stats["contests"] * 2
    )

    final_score = (
        dsa_score +
        cf_score +
        cc_score +
        github_score +
        contest_score
    )

    return round(final_score, 2)

# =========================================================
# DETERMINE LEVEL
# =========================================================
def determine_level(coder_score):
    if coder_score >= 2500:
        return "Elite Programmer"
    elif coder_score >= 1500:
        return "Interview Ready"
    elif coder_score >= 900:
        return "Advanced"
    elif coder_score >= 400:
        return "Intermediate"
    elif coder_score >= 150:
        return "Beginner"
    return "Starter"

# =========================================================
# SERIALIZER
# =========================================================
def serialize_profile(profile):
    return {
        "_id": str(profile["_id"]),
        "user_email": profile.get("user_email"),
        "platform": profile.get("platform"),
        "username": profile.get("username"),
        "stats": profile.get("stats", {}),
        "metadata": profile.get("metadata", {}),
        "updated_at": str(profile.get("updated_at")) if profile.get("updated_at") else None
    }

# =========================================================
# CHECK PLATFORM CONNECTION
# =========================================================
def is_platform_connected(user_email, platform):
    profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": platform.lower()
    })
    return profile is not None

# =========================================================
# GET CONNECTED PLATFORMS
# =========================================================
def get_connected_platforms(user_email):
    profiles = db.platform_profiles.find({
        "user_email": user_email
    })
    return [profile.get("platform") for profile in profiles]

# =========================================================
# REMOVE PLATFORM
# =========================================================
def disconnect_platform(user_email, platform):
    result = db.platform_profiles.delete_one({
        "user_email": user_email,
        "platform": platform.lower()
    })
    return result.deleted_count > 0