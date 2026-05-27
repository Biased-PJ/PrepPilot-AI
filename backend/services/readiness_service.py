from services.unified_profile import get_unified_stats


def readiness_score(user_email):

    stats = get_unified_stats(user_email)

    score = (
        stats["easy"] * 1 +
        stats["medium"] * 2 +
        stats["hard"] * 4
    )

    return min(score / 10, 100)