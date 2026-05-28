import requests
from bs4 import BeautifulSoup
from datetime import datetime

from config import db

# =========================================================
# CONFIG
# =========================================================

PLATFORM = "codechef"

HEADERS = {

    "User-Agent":
        (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
}

# =========================================================
# START VERIFICATION
# =========================================================

def start_verification(

    user_email,
    username
):

    if not username:

        return {

            "success": False,

            "error":
                "username required"
        }

    # =====================================================
    # CHECK USER EXISTS
    # =====================================================

    profile = scrape_profile(username)

    if not profile["success"]:

        return profile

    verification_text = (
        f"PrepPilot-{user_email}"
    )

    db.codechef_verification.update_one(

        {
            "user_email":
                user_email
        },

        {
            "$set": {

                "user_email":
                    user_email,

                "username":
                    username,

                "verification_text":
                    verification_text,

                "verified":
                    False,

                "updated_at":
                    datetime.utcnow()
            }
        },

        upsert=True
    )

    return {

        "success": True,

        "message":
            (
                "Add this text "
                "to your CodeChef bio"
            ),

        "verification_text":
            verification_text
    }

# =========================================================
# VERIFY ACCOUNT
# =========================================================

def verify_account(user_email):

    record = db.codechef_verification.find_one({

        "user_email":
            user_email
    })

    if not record:

        return {

            "success": False,

            "error":
                "Start verification first"
        }

    username = record["username"]

    verification_text = record[
        "verification_text"
    ]

    profile = scrape_profile(username)

    if not profile["success"]:

        return profile

    bio = profile["profile"].get(
        "bio",
        ""
    )

    if verification_text in bio:

        db.codechef_verification.update_one(

            {
                "user_email":
                    user_email
            },

            {
                "$set": {

                    "verified":
                        True,

                    "verified_at":
                        datetime.utcnow()
                }
            }
        )

        return {

            "success": True,

            "message":
                "CodeChef verified successfully"
        }

    return {

        "success": False,

        "error":
            (
                "Verification text "
                "not found in bio"
            )
    }

# =========================================================
# SYNC PROFILE
# =========================================================

def sync_profile(user_email):

    verification = db.codechef_verification.find_one({

        "user_email":
            user_email,

        "verified":
            True
    })

    if not verification:

        return {

            "success": False,

            "error":
                "CodeChef not verified"
        }

    username = verification["username"]

    # =====================================================
    # SCRAPE PROFILE
    # =====================================================

    profile = scrape_profile(username)

    if not profile["success"]:

        return profile

    profile_data = profile["profile"]

    # =====================================================
    # SAVE PROFILE
    # =====================================================

    db.platform_profiles.update_one(

        {

            "user_email":
                user_email,

            "platform":
                PLATFORM
        },

        {
            "$set": {

                "user_email":
                    user_email,

                "platform":
                    PLATFORM,

                "username":
                    username,

                # -----------------------------------------
                # PROFILE
                # -----------------------------------------

                "profile": {

                    "name":

                        profile_data.get(
                            "name"
                        ),

                    "country":

                        profile_data.get(
                            "country"
                        ),

                    "stars":

                        profile_data.get(
                            "stars"
                        ),

                    "global_rank":

                        profile_data.get(
                            "global_rank"
                        ),

                    "country_rank":

                        profile_data.get(
                            "country_rank"
                        )
                },

                # -----------------------------------------
                # STATS
                # -----------------------------------------

                "stats": {

                    "rating":

                        profile_data.get(
                            "rating",
                            0
                        ),

                    "highest_rating":

                        profile_data.get(
                            "highest_rating",
                            0
                        ),

                    "stars":

                        profile_data.get(
                            "stars",
                            0
                        ),

                    "contests":

                        profile_data.get(
                            "contests",
                            0
                        ),

                    "easy":

                        profile_data.get(
                            "easy",
                            0
                        ),

                    "medium":

                        profile_data.get(
                            "medium",
                            0
                        ),

                    "hard":

                        profile_data.get(
                            "hard",
                            0
                        ),

                    "total":

                        profile_data.get(
                            "total_solved",
                            0
                        )
                },

                # -----------------------------------------
                # METADATA
                # -----------------------------------------

                "metadata": {

                    "bio":

                        profile_data.get(
                            "bio",
                            ""
                        )
                },

                "updated_at":
                    datetime.utcnow()
            }
        },

        upsert=True
    )

    return {

        "success": True,

        "message":
            "CodeChef synced successfully",

        "stats": {

            "rating":

                profile_data.get(
                    "rating",
                    0
                ),

            "stars":

                profile_data.get(
                    "stars",
                    0
                ),

            "total_solved":

                profile_data.get(
                    "total_solved",
                    0
                )
        }
    }

# =========================================================
# SCRAPE PROFILE
# =========================================================

def scrape_profile(username):

    url = (
        f"https://www.codechef.com/users/"
        f"{username}"
    )

    try:

        response = requests.get(

            url,

            headers=HEADERS,

            timeout=15
        )

        if response.status_code != 200:

            return {

                "success": False,

                "error":
                    "Profile not found"
            }

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        # =================================================
        # NAME
        # =================================================

        name = ""

        try:

            name = soup.find(

                "div",

                class_="user-name-container"

            ).find("h2").text.strip()

        except:
            pass

        # =================================================
        # RATING
        # =================================================

        rating = 0

        highest_rating = 0

        stars = 0

        try:

            rating_box = soup.find(

                "div",

                class_="rating-number"
            )

            rating = int(
                rating_box.text.strip()
            )

        except:
            pass

        try:

            star_box = soup.find(

                "span",

                class_="rating"
            )

            stars_text = (
                star_box.text.strip()
            )

            stars = len(stars_text)

        except:
            pass

        # =================================================
        # GLOBAL / COUNTRY RANK
        # =================================================

        global_rank = None
        country_rank = None

        try:

            ranks = soup.find_all(
                "strong"
            )

            if len(ranks) >= 2:

                global_rank = (
                    ranks[0]
                    .text
                    .strip()
                )

                country_rank = (
                    ranks[1]
                    .text
                    .strip()
                )

        except:
            pass

        # =================================================
        # BIO
        # =================================================

        bio = ""

        try:

            bio_box = soup.find(

                "div",

                class_="user-details"
            )

            bio = bio_box.text.strip()

        except:
            pass

        # =================================================
        # COUNTRY
        # =================================================

        country = ""

        try:

            country = soup.find(

                "span",

                class_="user-country-name"
            ).text.strip()

        except:
            pass

        # =================================================
        # SOLVED COUNT ESTIMATION
        # =================================================

        easy = 0
        medium = 0
        hard = 0

        total_solved = (
            easy +
            medium +
            hard
        )

        contests = 0

        profile = {

            "name":
                name,

            "rating":
                rating,

            "highest_rating":
                highest_rating,

            "stars":
                stars,

            "global_rank":
                global_rank,

            "country_rank":
                country_rank,

            "country":
                country,

            "bio":
                bio,

            "easy":
                easy,

            "medium":
                medium,

            "hard":
                hard,

            "total_solved":
                total_solved,

            "contests":
                contests
        }

        return {

            "success": True,

            "profile":
                profile
        }

    except Exception as e:

        return {

            "success": False,

            "error":
                str(e)
        }

# =========================================================
# GET SAVED PROFILE
# =========================================================

def get_saved_profile(user_email):

    profile = db.platform_profiles.find_one({

        "user_email":
            user_email,

        "platform":
            PLATFORM
    })

    if not profile:

        return {

            "success": False,

            "error":
                "No synced profile found"
        }

    profile["_id"] = str(
        profile["_id"]
    )

    return {

        "success": True,

        "profile":
            profile
    }

# =========================================================
# REMOVE ACCOUNT
# =========================================================

def remove_account(user_email):

    db.codechef_verification.delete_many({

        "user_email":
            user_email
    })

    db.platform_profiles.delete_many({

        "user_email":
            user_email,

        "platform":
            PLATFORM
    })

    return {

        "success": True,

        "message":
            "CodeChef account removed"
    }