from config import db
from datetime import datetime
from services.unified_profile import get_unified_stats

# =========================================================
# MAIN LEADERBOARD FUNCTION
# =========================================================

def get_leaderboard(limit=10, current_user_email=None):

    # =====================================================
    # FETCH ALL USERS
    # =====================================================

    users = list(
        db.users.find({})
    )

    leaderboard = []

    # =====================================================
    # PROCESS EACH USER USING THE UNIFIED ANALYTICS SERVICE
    # =====================================================

    for user in users:

        email = user.get("email")

        if not email:
            continue

        # Pull the exact same live metrics your Analytics/Dashboard page uses
        stats = get_unified_stats(email)
        
        display_name = user.get("name") or email.split("@")[0]
        coder_score = stats.get("coder_score", 0)

        leaderboard.append({
            "name": display_name,
            "username": display_name,  # Unified matching interface key
            "email": email,
            
            # Pull metrics derived directly from the unified profiler
            "total_solved": stats.get("total", 0),
            "easy": stats.get("easy", 0),
            "medium": stats.get("medium", 0),
            "hard": stats.get("hard", 0),
            "streak": stats.get("current_streak", 0),
            
            # Map directly to frontend layout expectations
            "leaderboard_score": round(coder_score, 2),
            "coder_score": round(coder_score, 2),
            "you": (email == current_user_email)
        })

    # =====================================================
    # SORT LEADERBOARD
    # =====================================================

    leaderboard.sort(
        key=lambda x: (
            x["coder_score"],
            x["hard"],
            x["streak"]
        ),
        reverse=True
    )

    # =====================================================
    # ASSIGN RANKS
    # =====================================================

    for index, user in enumerate(leaderboard):
        user["rank"] = index + 1
        user["badge"] = get_badge(user["rank"])

    # =====================================================
    # RETURN TOP USERS
    # =====================================================

    return {
        "generated_at": str(datetime.utcnow()),
        "total_users": len(leaderboard),
        "leaderboard": leaderboard[:limit]
    }

# =========================================================
# BADGES
# =========================================================

def get_badge(rank):
    if rank == 1:
        return "🏆 Global Rank 1"
    elif rank <= 3:
        return "🥇 Top 3"
    elif rank <= 10:
        return "🔥 Top 10"
    elif rank <= 50:
        return "⭐ Rising Coder"
    return "💻 Active User"