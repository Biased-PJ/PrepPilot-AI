from config import db
from datetime import datetime, timedelta
import calendar

# =========================================================
# MAIN STREAK FUNCTION
# =========================================================

def get_streak(user_email):

    # =====================================================
    # FETCH USER PROGRESS
    # =====================================================

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        }).sort("solved_at", 1)

    )

    # =====================================================
    # EMPTY CASE
    # =====================================================

    if not progress_data:

        return {

            "current_streak": 0,

            "longest_streak": 0,

            "active_days": 0,

            "total_submissions": 0,

            "consistency_score": 0,

            "monthly_activity": {},

            "heatmap": {},

            "recent_activity": []
        }

    # =====================================================
    # EXTRACT DATES
    # =====================================================

    solved_dates = []

    recent_activity = []

    problems_per_day = {}

    topic_activity = {}

    for progress in progress_data:

        solved_at = progress.get("solved_at")

        if not solved_at:
            continue

        day = solved_at.date()

        solved_dates.append(day)

        # ---------------------------------------------
        # Problems Per Day
        # ---------------------------------------------

        date_key = str(day)

        problems_per_day[date_key] = (

            problems_per_day.get(date_key, 0)
            + 1
        )

        # ---------------------------------------------
        # Recent Activity
        # ---------------------------------------------

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if question:

            recent_activity.append({

                "date": date_key,

                "title": question.get("title"),

                "topic": question.get("topic"),

                "difficulty":
                    question.get("difficulty")
            })

            topic = question.get(
                "topic",
                "General"
            )

            topic_activity[topic] = (
                topic_activity.get(topic, 0)
                + 1
            )

    # =====================================================
    # UNIQUE SORTED DAYS
    # =====================================================

    unique_dates = sorted(
        list(set(solved_dates))
    )

    # =====================================================
    # CURRENT STREAK
    # =====================================================

    current_streak = calculate_current_streak(
        unique_dates
    )

    # =====================================================
    # LONGEST STREAK
    # =====================================================

    longest_streak = calculate_longest_streak(
        unique_dates
    )

    # =====================================================
    # CONSISTENCY SCORE
    # =====================================================

    consistency_score = calculate_consistency(
        unique_dates
    )

    # =====================================================
    # MONTHLY ACTIVITY
    # =====================================================

    monthly_activity = calculate_monthly_activity(
        solved_dates
    )

    # =====================================================
    # HEATMAP DATA
    # =====================================================

    heatmap = generate_heatmap(
        problems_per_day
    )

    # =====================================================
    # PRODUCTIVITY LEVEL
    # =====================================================

    productivity_level = determine_productivity(
        current_streak,
        consistency_score
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # ---------------------------------------------
        # Core Stats
        # ---------------------------------------------

        "current_streak":
            current_streak,

        "longest_streak":
            longest_streak,

        "active_days":
            len(unique_dates),

        "total_submissions":
            len(progress_data),

        # ---------------------------------------------
        # Performance
        # ---------------------------------------------

        "consistency_score":
            consistency_score,

        "productivity_level":
            productivity_level,

        # ---------------------------------------------
        # Activity
        # ---------------------------------------------

        "monthly_activity":
            monthly_activity,

        "heatmap":
            heatmap,

        "recent_activity":
            recent_activity[-10:],

        # ---------------------------------------------
        # Topics
        # ---------------------------------------------

        "most_active_topics":

            sorted(

                topic_activity.items(),

                key=lambda x: x[1],

                reverse=True

            )[:5]
    }

# =========================================================
# CURRENT STREAK
# =========================================================

def calculate_current_streak(unique_dates):

    if not unique_dates:
        return 0

    today = datetime.utcnow().date()

    yesterday = today - timedelta(days=1)

    latest = unique_dates[-1]

    # User inactive today and yesterday
    if latest not in [today, yesterday]:
        return 0

    streak = 1

    for i in range(
        len(unique_dates) - 1,
        0,
        -1
    ):

        diff = (

            unique_dates[i] -
            unique_dates[i - 1]

        ).days

        if diff == 1:

            streak += 1

        else:
            break

    return streak

# =========================================================
# LONGEST STREAK
# =========================================================

def calculate_longest_streak(unique_dates):

    if not unique_dates:
        return 0

    longest = 1

    current = 1

    for i in range(1, len(unique_dates)):

        diff = (

            unique_dates[i] -
            unique_dates[i - 1]

        ).days

        if diff == 1:

            current += 1

            longest = max(
                longest,
                current
            )

        else:

            current = 1

    return longest

# =========================================================
# CONSISTENCY SCORE
# =========================================================

def calculate_consistency(unique_dates):

    if not unique_dates:
        return 0

    today = datetime.utcnow().date()

    last_30_days = 0

    for i in range(30):

        day = today - timedelta(days=i)

        if day in unique_dates:

            last_30_days += 1

    return round(

        (last_30_days / 30) * 100,

        2
    )

# =========================================================
# MONTHLY ACTIVITY
# =========================================================

def calculate_monthly_activity(solved_dates):

    monthly = {}

    for day in solved_dates:

        key = f"{day.year}-{day.month}"

        monthly[key] = (
            monthly.get(key, 0) + 1
        )

    return monthly

# =========================================================
# GITHUB-LIKE HEATMAP
# =========================================================

def generate_heatmap(problems_per_day):

    heatmap = {}

    for date, count in problems_per_day.items():

        if count >= 10:

            level = 4

        elif count >= 6:

            level = 3

        elif count >= 3:

            level = 2

        elif count >= 1:

            level = 1

        else:

            level = 0

        heatmap[date] = {

            "count": count,

            "level": level
        }

    return heatmap

# =========================================================
# PRODUCTIVITY LEVEL
# =========================================================

def determine_productivity(

    current_streak,
    consistency_score
):

    score = (

        current_streak * 2 +

        consistency_score
    )

    if score >= 90:
        return "Exceptional"

    elif score >= 70:
        return "Highly Consistent"

    elif score >= 50:
        return "Consistent"

    elif score >= 30:
        return "Improving"

    return "Irregular"