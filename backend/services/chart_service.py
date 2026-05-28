from config import db
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

# =========================================================
# STATIC DIRECTORY
# =========================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

STATIC_DIR = os.path.join(
    BASE_DIR,
    "static",
    "charts"
)

os.makedirs(
    STATIC_DIR,
    exist_ok=True
)

# =========================================================
# MAIN CHART GENERATOR
# =========================================================

def generate_user_charts(user_email):

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    # =====================================================
    # EMPTY CASE
    # =====================================================

    if not progress_data:

        return {

            "success": False,

            "message":
                "No solved problems found"
        }

    # =====================================================
    # GENERATE CHARTS
    # =====================================================

    charts = {

        "topic_distribution":
            generate_topic_chart(

                user_email,
                progress_data
            ),

        "difficulty_distribution":
            generate_difficulty_chart(

                user_email,
                progress_data
            ),

        "weekly_activity":
            generate_weekly_chart(

                user_email,
                progress_data
            ),

        "platform_distribution":
            generate_platform_chart(

                user_email,
                progress_data
            ),

        "progress_timeline":
            generate_progress_chart(

                user_email,
                progress_data
            )
    }

    return {

        "success": True,

        "charts": charts
    }

# =========================================================
# TOPIC DISTRIBUTION CHART
# =========================================================

def generate_topic_chart(

    user_email,
    progress_data
):

    topics = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if question:

            topics.append(
                question.get(
                    "topic",
                    "General"
                )
            )

    if not topics:
        return None

    df = pd.DataFrame({
        "topic": topics
    })

    counts = df["topic"].value_counts()

    plt.figure(figsize=(10, 6))

    counts.plot(kind="bar")

    plt.title(
        "Topic Distribution"
    )

    plt.xlabel("Topics")

    plt.ylabel(
        "Problems Solved"
    )

    plt.xticks(rotation=45)

    path = save_chart(
        plt,
        user_email,
        "topic_distribution"
    )

    return path

# =========================================================
# DIFFICULTY DISTRIBUTION
# =========================================================

def generate_difficulty_chart(

    user_email,
    progress_data
):

    difficulties = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if question:

            difficulties.append(

                question.get(
                    "difficulty",
                    "EASY"
                )
            )

    if not difficulties:
        return None

    df = pd.DataFrame({
        "difficulty": difficulties
    })

    counts = df[
        "difficulty"
    ].value_counts()

    plt.figure(figsize=(7, 7))

    counts.plot(
        kind="pie",
        autopct="%1.1f%%"
    )

    plt.title(
        "Difficulty Distribution"
    )

    plt.ylabel("")

    path = save_chart(
        plt,
        user_email,
        "difficulty_distribution"
    )

    return path

# =========================================================
# WEEKLY ACTIVITY
# =========================================================

def generate_weekly_chart(

    user_email,
    progress_data
):

    today = datetime.utcnow().date()

    activity = {}

    for i in range(7):

        day = today - timedelta(days=i)

        activity[str(day)] = 0

    for progress in progress_data:

        solved_at = progress.get(
            "solved_at"
        )

        if solved_at:

            key = str(
                solved_at.date()
            )

            if key in activity:

                activity[key] += 1

    df = pd.DataFrame({

        "date":
            list(activity.keys()),

        "count":
            list(activity.values())
    })

    df = df.sort_values("date")

    plt.figure(figsize=(10, 5))

    plt.plot(

        df["date"],

        df["count"],

        marker="o"
    )

    plt.title(
        "Weekly Solving Activity"
    )

    plt.xlabel("Date")

    plt.ylabel(
        "Problems Solved"
    )

    plt.xticks(rotation=45)

    path = save_chart(
        plt,
        user_email,
        "weekly_activity"
    )

    return path

# =========================================================
# PLATFORM DISTRIBUTION
# =========================================================

def generate_platform_chart(

    user_email,
    progress_data
):

    platforms = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress["question_id"]
        })

        if question:

            platforms.append(

                question.get(
                    "platform",
                    "Unknown"
                )
            )

    if not platforms:
        return None

    df = pd.DataFrame({
        "platform": platforms
    })

    counts = df[
        "platform"
    ].value_counts()

    plt.figure(figsize=(8, 5))

    counts.plot(kind="bar")

    plt.title(
        "Platform Distribution"
    )

    plt.xlabel("Platform")

    plt.ylabel(
        "Problems Solved"
    )

    plt.xticks(rotation=0)

    path = save_chart(
        plt,
        user_email,
        "platform_distribution"
    )

    return path

# =========================================================
# PROGRESS TIMELINE
# =========================================================

def generate_progress_chart(

    user_email,
    progress_data
):

    dates = []

    for progress in progress_data:

        solved_at = progress.get(
            "solved_at"
        )

        if solved_at:

            dates.append(
                solved_at.date()
            )

    if not dates:
        return None

    dates = sorted(dates)

    cumulative = []

    count = 0

    for _ in dates:

        count += 1

        cumulative.append(count)

    plt.figure(figsize=(10, 5))

    plt.plot(
        dates,
        cumulative
    )

    plt.title(
        "Progress Timeline"
    )

    plt.xlabel("Date")

    plt.ylabel(
        "Total Solved"
    )

    plt.xticks(rotation=45)

    path = save_chart(
        plt,
        user_email,
        "progress_timeline"
    )

    return path

# =========================================================
# SAVE CHART
# =========================================================

def save_chart(

    plt_object,
    user_email,
    chart_name
):

    safe_email = (

        user_email
        .replace("@", "_")
        .replace(".", "_")
    )

    filename = (
        f"{safe_email}_{chart_name}.png"
    )

    path = os.path.join(
        STATIC_DIR,
        filename
    )

    plt_object.tight_layout()

    plt_object.savefig(path)

    plt_object.close()

    return f"/static/charts/{filename}"

# =========================================================
# GENERATE HEATMAP DATA
# =========================================================

def generate_heatmap_data(user_email):

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    heatmap = {}

    for progress in progress_data:

        solved_at = progress.get(
            "solved_at"
        )

        if not solved_at:
            continue

        key = str(
            solved_at.date()
        )

        heatmap[key] = (
            heatmap.get(key, 0)
            + 1
        )

    formatted = {}

    for date, count in heatmap.items():

        level = 0

        if count >= 10:

            level = 4

        elif count >= 6:

            level = 3

        elif count >= 3:

            level = 2

        elif count >= 1:

            level = 1

        formatted[date] = {

            "count": count,

            "level": level
        }

    return formatted