import requests
from datetime import datetime
from pymongo.errors import BulkWriteError

from config import db

# =========================================================
# CONFIG
# =========================================================

LEETCODE_GRAPHQL_URL = (
    "https://leetcode.com/graphql"
)

HEADERS = {

    "Content-Type":
        "application/json",

    "User-Agent":
        (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),

    "Referer":
        "https://leetcode.com",

    "Origin":
        "https://leetcode.com"
}

# =========================================================
# GRAPHQL QUERY
# =========================================================

LEETCODE_QUERY = """

query problemsetQuestionListV2(
    $categorySlug: String,
    $limit: Int,
    $skip: Int
) {

    problemsetQuestionListV2(

        categorySlug: $categorySlug,
        limit: $limit,
        skip: $skip

    ) {

        questions {

            questionFrontendId

            title

            titleSlug

            difficulty

            acRate

            paidOnly

            topicTags {
                name
            }
        }
    }
}

"""

# =========================================================
# MAIN IMPORT FUNCTION
# =========================================================

def import_leetcode_questions(

    max_questions=4000,
    batch_size=100
):

    # =====================================================
    # EXISTING SLUGS
    # =====================================================

    existing_slugs = set(

        q["slug"]

        for q in db.questions.find(
            {},
            {"slug": 1}
        )

        if "slug" in q
    )

    # =====================================================
    # TRACKERS
    # =====================================================

    total_fetched = 0

    total_inserted = 0

    total_skipped = 0

    total_failed = 0

    imported_questions = []

    # =====================================================
    # PAGINATION LOOP
    # =====================================================

    for skip in range(

        0,
        max_questions,
        batch_size
    ):

        print(
            f"Fetching batch "
            f"{skip} -> {skip + batch_size}"
        )

        payload = {

            "query":
                LEETCODE_QUERY,

            "variables": {

                "categorySlug": "",

                "limit":
                    batch_size,

                "skip":
                    skip
            }
        }

        # =================================================
        # REQUEST
        # =================================================

        try:

            response = requests.post(

                LEETCODE_GRAPHQL_URL,

                json=payload,

                headers=HEADERS,

                timeout=20
            )

        except Exception as e:

            print("Request failed:", e)

            total_failed += batch_size

            continue

        # =================================================
        # STATUS CHECK
        # =================================================

        if response.status_code != 200:

            print(
                "Invalid response:",
                response.status_code
            )

            total_failed += batch_size

            continue

        # =================================================
        # JSON PARSE
        # =================================================

        try:

            data = response.json()

        except Exception:

            print("Invalid JSON response")

            total_failed += batch_size

            continue

        # =================================================
        # EXTRACT QUESTIONS
        # =================================================

        questions_data = (

            data
            .get("data", {})
            .get(
                "problemsetQuestionListV2",
                {}
            )
            .get("questions", [])
        )

        # =================================================
        # FINISHED
        # =================================================

        if len(questions_data) == 0:

            print(
                "Finished importing"
            )

            break

        total_fetched += len(
            questions_data
        )

        batch_insert = []

        # =================================================
        # PROCESS QUESTIONS
        # =================================================

        for q in questions_data:

            try:

                question = normalize_question(q)

                if not question:
                    continue

                slug = question["slug"]

                # -----------------------------------------
                # SKIP DUPLICATES
                # -----------------------------------------

                if slug in existing_slugs:

                    total_skipped += 1

                    continue

                batch_insert.append(
                    question
                )

                existing_slugs.add(slug)

            except Exception as e:

                print(
                    "Normalization failed:",
                    e
                )

                total_failed += 1

        # =================================================
        # BULK INSERT
        # =================================================

        if batch_insert:

            try:

                db.questions.insert_many(

                    batch_insert,

                    ordered=False
                )

                total_inserted += len(
                    batch_insert
                )

                imported_questions.extend(
                    batch_insert
                )

            except BulkWriteError:

                pass

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "success": True,

        "message":
            "LeetCode questions imported",

        "stats": {

            "fetched":
                total_fetched,

            "inserted":
                total_inserted,

            "skipped":
                total_skipped,

            "failed":
                total_failed,

            "database_total":

                db.questions.count_documents({})
        }
    }

# =========================================================
# NORMALIZE QUESTION
# =========================================================

def normalize_question(raw):

    title = raw.get("title")

    slug = raw.get("titleSlug")

    if not title or not slug:

        return None

    topic_tags = [

        tag.get("name")

        for tag in raw.get(
            "topicTags",
            []
        )

        if tag.get("name")
    ]

    difficulty = (
        raw.get(
            "difficulty",
            "EASY"
        ).upper()
    )

    ac_rate = raw.get("acRate")

    question = {

        # ---------------------------------------------
        # Basic
        # ---------------------------------------------

        "title":
            title,

        "slug":
            slug,

        "difficulty":
            difficulty,

        "platform":
            "LeetCode",

        "source":
            "LeetCode",

        # ---------------------------------------------
        # Topic
        # ---------------------------------------------

        "topic":

            topic_tags[0]

            if topic_tags
            else "General",

        "tags":
            topic_tags,

        # ---------------------------------------------
        # Metadata
        # ---------------------------------------------

        "companies":
            [],

        "acceptance_rate":

            round(ac_rate, 2)

            if ac_rate
            else None,

        "paid_only":
            raw.get(
                "paidOnly",
                False
            ),

        # ---------------------------------------------
        # URL
        # ---------------------------------------------

        "link":
            (
                "https://leetcode.com/"
                f"problems/{slug}/"
            ),

        # ---------------------------------------------
        # Tracking
        # ---------------------------------------------

        "created_at":
            datetime.utcnow()
    }

    return question

# =========================================================
# IMPORT SINGLE QUESTION
# =========================================================

def import_single_question(question):

    normalized = normalize_question(
        question
    )

    if not normalized:

        return {

            "success": False,

            "error":
                "Invalid question"
        }

    existing = db.questions.find_one({

        "slug":
            normalized["slug"]
    })

    if existing:

        return {

            "success": False,

            "error":
                "Question already exists"
        }

    result = db.questions.insert_one(
        normalized
    )

    return {

        "success": True,

        "question_id":
            str(result.inserted_id)
    }

# =========================================================
# REFRESH QUESTIONS
# =========================================================

def refresh_leetcode_dataset():

    before = db.questions.count_documents({
        "platform": "LeetCode"
    })

    result = import_leetcode_questions()

    after = db.questions.count_documents({
        "platform": "LeetCode"
    })

    result["newly_added"] = (
        after - before
    )

    return result