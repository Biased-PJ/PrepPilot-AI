from config import db
from datetime import datetime, timedelta

# =========================================================
# DIFFICULTY WEIGHTS
# =========================================================

DIFFICULTY_WEIGHTS = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 5
}

# =========================================================
# MAIN LEADERBOARD FUNCTION
# =========================================================

def get_leaderboard(limit=10):

    # =====================================================
    # FETCH ALL USERS
    # =====================================================

    users = list(
        db.users.find({})
    )

    leaderboard = []

    # =====================================================
    # PROCESS EACH USER
    # =====================================================

    for user in users:

        email = user.get("email")

        if not email:
            continue

        progress_data = list(

            db.user_progress.find({
                "user_email": email
            })

        )

        # =================================================
        # USER STATS
        # =================================================

        total_solved = 0

        easy = 0

        medium = 0

        hard = 0

        total_score = 0

        streak = 0

        last_active = None

        active_days = set()

        contests = 0

        # =================================================
        # PROCESS PROGRESS
        # =================================================

        for progress in progress_data:

            question = db.questions.find_one({
                "_id": progress["question_id"]
            })

            if not question:
                continue

            difficulty = (
                question.get(
                    "difficulty",
                    "EASY"
                ).upper()
            )

            total_solved += 1

            # ---------------------------------------------
            # Difficulty Counts
            # ---------------------------------------------

            if difficulty == "EASY":

                easy += 1

            elif difficulty == "MEDIUM":

                medium += 1

            elif difficulty == "HARD":

                hard += 1

            # ---------------------------------------------
            # Weighted Score
            # ---------------------------------------------

            total_score += (
                DIFFICULTY_WEIGHTS.get(
                    difficulty,
                    1
                )
            )

            # ---------------------------------------------
            # Activity
            # ---------------------------------------------

            solved_at = progress.get(
                "solved_at"
            )

            if solved_at:

                active_days.add(
                    solved_at.date()
                )

                if (
                    last_active is None
                    or solved_at > last_active
                ):

                    last_active = solved_at

        # =================================================
        # PLATFORM STATS
        # =================================================

        platform_profiles = list(

            db.platform_profiles.find({
                "user_email": email
            })

        )

        cf_rating = 0
        cc_rating = 0
        lc_total = 0

        for profile in platform_profiles:

            platform = profile.get(
                "platform",
                ""
            ).lower()

            stats = profile.get(
                "stats",
                {}
            )

            # ---------------------------------------------
            # Codeforces
            # ---------------------------------------------

            if platform == "codeforces":

                cf_rating = max(

                    cf_rating,

                    stats.get(
                        "rating",
                        0
                    )
                )

                contests += stats.get(
                    "contests",
                    0
                )

            # ---------------------------------------------
            # CodeChef
            # ---------------------------------------------

            elif platform == "codechef":

                cc_rating = max(

                    cc_rating,

                    stats.get(
                        "rating",
                        0
                    )
                )

                contests += stats.get(
                    "contests",
                    0
                )

            # ---------------------------------------------
            # LeetCode
            # ---------------------------------------------

            elif platform == "leetcode":

                lc_total += stats.get(
                    "total",
                    0
                )

        # =================================================
        # STREAK
        # =================================================

        streak = calculate_streak(
            active_days
        )

        # =================================================
        # FINAL LEADERBOARD SCORE
        # =================================================

        leaderboard_score = calculate_score(

            total_score,
            streak,
            cf_rating,
            cc_rating,
            contests
        )

        # =================================================
        # USER ENTRY
        # =================================================

        leaderboard.append({

            "name":
                user.get("name"),

            "email":
                email,

            # ---------------------------------------------
            # Solved Stats
            # ---------------------------------------------

            "total_solved":
                total_solved,

            "easy":
                easy,

            "medium":
                medium,

            "hard":
                hard,

            # ---------------------------------------------
            # Ratings
            # ---------------------------------------------

            "codeforces_rating":
                cf_rating,

            "codechef_rating":
                cc_rating,

            # ---------------------------------------------
            # Contest
            # ---------------------------------------------

            "contests":
                contests,

            # ---------------------------------------------
            # Activity
            # ---------------------------------------------

            "streak":
                streak,

            "active_days":
                len(active_days),

            "last_active":

                str(last_active)

                if last_active
                else None,

            # ---------------------------------------------
            # Score
            # ---------------------------------------------

            "leaderboard_score":
                round(
                    leaderboard_score,
                    2
                )
        })

    # =====================================================
    # SORT LEADERBOARD
    # =====================================================

    leaderboard.sort(

        key=lambda x: (
            x["leaderboard_score"],
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

        user["badge"] = get_badge(
            user["rank"]
        )

    # =====================================================
    # RETURN TOP USERS
    # =====================================================

    return {

        "generated_at":
            str(datetime.utcnow()),

        "total_users":
            len(leaderboard),

        "leaderboard":
            leaderboard[:limit]
    }

# =========================================================
# CALCULATE STREAK
# =========================================================

def calculate_streak(active_days):

    if not active_days:
        return 0

    dates = sorted(
        list(active_days)
    )

    today = datetime.utcnow().date()

    yesterday = today - timedelta(days=1)

    latest = dates[-1]

    if latest not in [today, yesterday]:
        return 0

    streak = 1

    for i in range(
        len(dates) - 1,
        0,
        -1
    ):

        diff = (
            dates[i] -
            dates[i - 1]
        ).days

        if diff == 1:

            streak += 1

        else:
            break

    return streak

# =========================================================
# FINAL SCORE
# =========================================================

def calculate_score(

    total_score,
    streak,
    cf_rating,
    cc_rating,
    contests
):

    # =====================================================
    # BASE SCORE
    # =====================================================

    base = total_score

    # =====================================================
    # STREAK BONUS
    # =====================================================

    streak_bonus = (
        streak * 3
    )

    # =====================================================
    # CONTEST BONUS
    # =====================================================

    contest_bonus = (
        contests * 2
    )

    # =====================================================
    # PLATFORM BONUS
    # =====================================================

    cf_bonus = (
        cf_rating * 0.05
    )

    cc_bonus = (
        cc_rating * 0.03
    )

    # =====================================================
    # FINAL
    # =====================================================

    return (

        base +

        streak_bonus +

        contest_bonus +

        cf_bonus +

        cc_bonus
    )

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