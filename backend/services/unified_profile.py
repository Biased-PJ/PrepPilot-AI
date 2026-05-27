from config import db


def get_platform_profiles(user_email):

    return list(db.platform_profiles.find({
        "user_email": user_email
    }))


def get_unified_stats(user_email):

    platforms = get_platform_profiles(user_email)

    stats = {
        "easy": 0,
        "medium": 0,
        "hard": 0,
        "total": 0
    }

    for p in platforms:

        s = p.get("stats", {})

        stats["easy"] += s.get("easy", 0)
        stats["medium"] += s.get("medium", 0)
        stats["hard"] += s.get("hard", 0)
        stats["total"] += s.get("total", 0)

    return stats