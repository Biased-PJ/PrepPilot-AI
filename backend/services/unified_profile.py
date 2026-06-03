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
        "easy": 0,
        "medium": 0,
        "hard": 0,
        "total": 0,
        "codeforces_rating": 0,
        "codeforces_max_rating": 0,
        "codechef_rating": 0,
        "github_repos": 0,
        "github_followers": 0,
        "github_stars": 0,
        "contests": 0,
        "connected_platforms": 0,
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
        # CODEFORCES (Corrected Keys Matching your Database Schema)
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
            
            # Use exact native keys from your schema document
            unified["easy"] += stats.get("easy", 0)
            unified["medium"] += stats.get("medium", 0)
            unified["hard"] += stats.get("hard", 0)
            unified["total"] += stats.get("total", 0)

        # =================================================
        # CODECHEF
        # =================================================
        elif platform == "codechef":
            unified["codechef_rating"] = max(
                unified["codechef_rating"],
                stats.get("rating", 0)
            )
            unified["contests"] += stats.get("contests", 0)
            unified["total"] += stats.get("total", 0)  # Standardized fallback fallback key check

        # =================================================
        # GITHUB
        # =================================================
        elif platform == "github":
            unified["github_repos"] += stats.get("repos", 0)
            unified["github_followers"] += stats.get("followers", 0)
            unified["github_stars"] += stats.get("stars", 0)

    # =====================================================
    # OVERALL CODER SCORE & LEVEL SETS
    # =====================================================
    unified["coder_score"] = calculate_coder_score(unified)
    unified["level"] = determine_level(unified["coder_score"])

    return unified

import math

# CODER SCORE CALCULATOR (Composite Metric with Diminishing Returns and Caps)

def calculate_coder_score(stats):
    # =====================================================
    # 1. DSA PROBLEM ACCUMULATION (Diminishing Returns)
    # =====================================================
    # Instead of raw multiplication, we apply a log curve so solving 
    # 1000 easy questions doesn't infinitely inflate the score.
    raw_dsa_points = (
        stats.get("easy", 0) * 0.5 +
        stats.get("medium", 0) * 1.5 +
        stats.get("hard", 0) * 3.5
    )
    # Log base 2 smoothing: Keeps progression rewarding but bounded
    dsa_score = 20 * math.log2(raw_dsa_points + 1)

    # =====================================================
    # 2. COMPETITIVE PROGRAMMING RATINGS (Exponential Scale)
    # =====================================================
    # High ratings are significantly harder to achieve, so we scale them non-linearly.
    cf_rating = stats.get("codeforces_rating", 0)
    cf_score = 0
    if cf_rating > 0:
        # Penalize scores under baseline (800), reward exponentially past milestones
        cf_score = max(0, (cf_rating / 250) ** 3)

    cc_rating = stats.get("codechef_rating", 0)
    cc_score = 0
    if cc_rating > 0:
        cc_score = max(0, (cc_rating / 300) ** 3)

    # =====================================================
    # 3. OPEN SOURCE & GIT INFLUENCE (Impact Cap)
    # =====================================================
    repos = stats.get("github_repos", 0)
    followers = stats.get("github_followers", 0)
    stars = stats.get("github_stars", 0)
    
    # Repos cap early (quality over quantity), stars/followers scale smoothly
    github_score = (
        min(repos, 15) * 1.5 + 
        (5 * math.log1p(followers)) + 
        (8 * math.log1p(stars))
    )

    # =====================================================
    # 4. CONTEST EXPERIENCE (Consistency Bonus)
    # =====================================================
    contests = stats.get("contests", 0)
    contest_score = 15 * math.log2(contests + 1)

    # =====================================================
    # FINAL WEIGHTED AGGREGATION
    # =====================================================
    final_score = dsa_score + cf_score + cc_score + github_score + contest_score
    
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