from config import db
from datetime import datetime


def get_streak(user_email):

    progress_data = list(
        db.user_progress.find({
            "user_email": user_email
        }).sort("solved_at", 1)
    )

    if not progress_data:
        return {
            "current_streak": 0,
            "active_days": 0
        }

    solve_dates = sorted(list(set([
        p["solved_at"].date()
        for p in progress_data
        if p.get("solved_at")
    ])))

    if not solve_dates:
        return {
            "current_streak": 0,
            "active_days": 0
        }

    current_streak = 1

    for i in range(len(solve_dates) - 1, 0, -1):

        if (solve_dates[i] - solve_dates[i - 1]).days == 1:
            current_streak += 1
        else:
            break

    return {
        "current_streak": current_streak,
        "active_days": len(solve_dates),
        "last_solved_date": str(solve_dates[-1])
    }