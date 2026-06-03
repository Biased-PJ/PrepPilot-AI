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
    return [serialize_profile(p) for p in profiles]

# =========================================================
# GET SINGLE PLATFORM PROFILE
# =========================================================

def get_platform_profile(user_email, platform):
    profile = db.platform_profiles.find_one({
        "user_email": user_email,
        "platform": platform.lower()
    })
    return serialize_profile(profile) if profile else None

# =========================================================
# GET UNIFIED STATS
# =========================================================

def get_unified_stats(user_email):
    profiles = list(db.platform_profiles.find({"user_email": user_email}))

    unified = {
        "easy": 0, "medium": 0, "hard": 0, "total": 0,
        "codeforces_rating": 0, "codeforces_max_rating": 0, "codechef_rating": 0,
        "github_repos": 0, "github_followers": 0, "github_stars": 0,
        "contests": 0, "connected_platforms": 0, "platforms": []
    }

    for profile in profiles:
        platform = profile.get("platform", "").lower()
        stats = profile.get("stats", {})

        unified["connected_platforms"] += 1
        unified["platforms"].append(platform)

        # 1. LEETCODE (Strictly maintains difficulty distribution buckets)
        if platform == "leetcode":
            unified["easy"] += stats.get("easy", 0)
            unified["medium"] += stats.get("medium", 0)
            unified["hard"] += stats.get("hard", 0)
            unified["total"] += stats.get("total", 0)

        # 2. CODEFORCES (Aggregates performance benchmarks, skips LC breakdown)
        elif platform == "codeforces":
            unified["codeforces_rating"] = max(unified["codeforces_rating"], stats.get("rating", 0))
            unified["codeforces_max_rating"] = max(unified["codeforces_max_rating"], stats.get("max_rating", 0))
            unified["contests"] += stats.get("contests", 0)
            unified["total"] += stats.get("total", 0)  

        # 3. CODECHEF
        elif platform == "codechef":
            unified["codechef_rating"] = max(unified["codechef_rating"], stats.get("rating", 0))
            unified["contests"] += stats.get("contests", 0)
            unified["total"] += stats.get("total", 0)

        # 4. GITHUB
        elif platform == "github":
            unified["github_repos"] += stats.get("repos", 0)
            unified["github_followers"] += stats.get("followers", 0)
            unified["github_stars"] += stats.get("stars", 0)

    # Compute premium tracking attributes
    unified["coder_score"] = calculate_coder_score(unified, user_email)
    unified["level"] = determine_level(unified["coder_score"])

    return unified

# =========================================================
# CODER SCORE PIPELINE
# =========================================================

def calculate_coder_score(stats, user_email):
    # 1. LeetCode Flat Weighting (Isolated cleanly from CF items)
    leetcode_score = (
        stats.get("easy", 0) * 0.5 +
        stats.get("medium", 0) * 1.0 +
        stats.get("hard", 0) * 1.5
    )

    # 2. Dynamic Codeforces Individual Problem Extraction via Pipeline
    cf_problem_points = 0
    pipeline = [
        {"$match": {"user_email": user_email, "platform": "codeforces", "verdict": "OK"}},
        {"$group": {"_id": "$problem_id", "rating": {"$first": "$rating"}}}
    ]
    
    solved_questions = list(db.user_submissions.aggregate(pipeline))
    for question in solved_questions:
        prob_rating = question.get("rating")
        if prob_rating:
            # Scale points exponentially relative to dynamic difficulty metrics
            cf_problem_points += (prob_rating / 1000) ** 1.5
        else:
            cf_problem_points += 0.4 

    # 3. Platform Live Rank Rating Multipliers
    cf_rating_score = stats.get("codeforces_rating", 0) * 0.05
    cc_rating_score = stats.get("codechef_rating", 0) * 0.03

    # 4. Git Contributions Portfolio Engine
    github_score = (
        stats.get("github_repos", 0) * 2 +
        stats.get("github_followers", 0) * 1.5 +
        stats.get("github_stars", 0) * 0.5
    )

    # 5. Live Competitive Contest Attendance Milestones
    contest_attendance_score = stats.get("contests", 0) * 2

    final_score = (
        leetcode_score + 
        cf_problem_points + 
        cf_rating_score + 
        cc_rating_score + 
        github_score + 
        contest_attendance_score
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
    profiles = db.platform_profiles.find({"user_email": user_email})
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