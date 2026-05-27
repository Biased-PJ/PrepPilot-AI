from services.unified_profile import get_unified_stats
from config import db
import numpy as np


def compute_analytics(user_email):

    platform_stats = get_unified_stats(user_email)

    local_count = db.user_progress.count_documents({
        "user_email": user_email
    })

    total_solved = local_count + platform_stats["total"]

    difficulty_score = (
        platform_stats["easy"] * 1 +
        platform_stats["medium"] * 2 +
        platform_stats["hard"] * 4
    )

    return {
        "total_solved": total_solved,
        "platform_stats": platform_stats,
        "difficulty_score": difficulty_score
    }