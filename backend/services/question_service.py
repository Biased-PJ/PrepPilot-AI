from config import db
from bson import ObjectId
from datetime import datetime
import math
import random

# =========================================================
# SERIALIZER
# =========================================================

def serialize_question(question):

    return {

        "question_id":
            str(question["_id"]),

        "title":
            question.get("title"),

        "slug":
            question.get("slug"),

        "topic":
            question.get("topic"),

        "difficulty":
            question.get("difficulty"),

        "platform":
            question.get("platform"),

        "source":
            question.get("source"),

        "companies":
            question.get("companies", []),

        "tags":
            question.get("tags", []),

        "acceptance_rate":
            question.get("acceptance_rate"),

        "paid_only":
            question.get("paid_only", False),

        "link":
            question.get("link"),

        "created_at":

            str(question.get("created_at"))

            if question.get("created_at")

            else None
    }

# =========================================================
# ADD QUESTION
# =========================================================

def add_question(data):

    title = data.get("title")

    if not title:

        return {
            "success": False,
            "error": "Title is required"
        }

    slug = title.lower().replace(
        " ",
        "-"
    )

    existing = db.questions.find_one({
        "slug": slug
    })

    if existing:

        return {
            "success": False,
            "error": "Question already exists"
        }

    question = {

        "title":
            title,

        "slug":
            slug,

        "topic":
            data.get(
                "topic",
                "General"
            ),

        "difficulty":

            data.get(
                "difficulty",
                "EASY"
            ).upper(),

        "platform":
            data.get(
                "platform",
                "LeetCode"
            ),

        "source":
            data.get(
                "source",
                "Manual"
            ),

        "companies":
            data.get(
                "companies",
                []
            ),

        "tags":
            data.get(
                "tags",
                []
            ),

        "acceptance_rate":
            data.get(
                "acceptance_rate"
            ),

        "paid_only":
            data.get(
                "paid_only",
                False
            ),

        "link":
            data.get(
                "link",
                ""
            ),

        "created_at":
            datetime.utcnow()
    }

    result = db.questions.insert_one(
        question
    )

    return {

        "success": True,

        "message":
            "Question added successfully",

        "question_id":
            str(result.inserted_id)
    }

# =========================================================
# GET QUESTIONS
# =========================================================

def get_questions(

    page=1,
    limit=20,
    filters=None
):

    filters = filters or {}

    query = build_query(filters)

    limit = min(limit, 100)

    skip = (page - 1) * limit

    questions_cursor = db.questions.find(

        query

    ).skip(skip).limit(limit)

    questions = [

        serialize_question(q)

        for q in questions_cursor
    ]

    total = db.questions.count_documents(
        query
    )

    return {

        "page":
            page,

        "limit":
            limit,

        "total_questions":
            total,

        "total_pages":

            math.ceil(total / limit),

        "questions":
            questions
    }

# =========================================================
# GET QUESTION BY ID
# =========================================================

def get_question_by_id(question_id):

    try:

        object_id = ObjectId(question_id)

    except:

        return None

    question = db.questions.find_one({
        "_id": object_id
    })

    if not question:
        return None

    return serialize_question(question)

# =========================================================
# UPDATE QUESTION
# =========================================================

def update_question(

    question_id,
    data
):

    try:

        object_id = ObjectId(question_id)

    except:

        return {
            "success": False,
            "error": "Invalid question id"
        }

    existing = db.questions.find_one({
        "_id": object_id
    })

    if not existing:

        return {
            "success": False,
            "error": "Question not found"
        }

    update_data = {}

    allowed_fields = [

        "title",
        "topic",
        "difficulty",
        "platform",
        "source",
        "companies",
        "tags",
        "acceptance_rate",
        "paid_only",
        "link"
    ]

    for field in allowed_fields:

        if field in data:

            update_data[field] = data[field]

    # =====================================================
    # UPDATE SLUG
    # =====================================================

    if "title" in update_data:

        update_data["slug"] = (

            update_data["title"]
            .lower()
            .replace(" ", "-")
        )

    db.questions.update_one(

        {"_id": object_id},

        {
            "$set": update_data
        }
    )

    return {

        "success": True,

        "message":
            "Question updated successfully"
    }

# =========================================================
# DELETE QUESTION
# =========================================================

def delete_question(question_id):

    try:

        object_id = ObjectId(question_id)

    except:

        return {
            "success": False,
            "error": "Invalid question id"
        }

    result = db.questions.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:

        return {
            "success": False,
            "error": "Question not found"
        }

    # =====================================================
    # REMOVE USER PROGRESS
    # =====================================================

    db.user_progress.delete_many({
        "question_id": object_id
    })

    return {

        "success": True,

        "message":
            "Question deleted successfully"
    }

# =========================================================
# SEARCH QUESTIONS
# =========================================================

def search_questions(keyword):

    if not keyword:

        return {
            "total_results": 0,
            "questions": []
        }

    questions = list(

        db.questions.find({

            "$text": {
                "$search": keyword
            }

        }).limit(50)

    )

    return {

        "total_results":
            len(questions),

        "questions": [

            serialize_question(q)

            for q in questions
        ]
    }

# =========================================================
# RANDOM QUESTION
# =========================================================

def get_random_question():

    pipeline = [
        {
            "$sample": {
                "size": 1
            }
        }
    ]

    questions = list(
        db.questions.aggregate(pipeline)
    )

    if not questions:
        return None

    return serialize_question(
        questions[0]
    )

# =========================================================
# DAILY QUESTION
# =========================================================

def get_daily_question():

    total = db.questions.count_documents({})

    if total == 0:
        return None

    today = datetime.utcnow().strftime(
        "%Y-%m-%d"
    )

    seed = sum(
        ord(c)
        for c in today
    )

    index = seed % total

    question = list(

        db.questions.find()

        .skip(index)

        .limit(1)
    )

    if not question:
        return None

    return serialize_question(
        question[0]
    )

# =========================================================
# COMPANY QUESTIONS
# =========================================================

def get_company_questions(company):

    questions = list(

        db.questions.find({

            "companies": {

                "$elemMatch": {

                    "$regex": company,

                    "$options": "i"
                }
            }

        })

    )

    return {

        "company":
            company,

        "total_questions":
            len(questions),

        "questions": [

            serialize_question(q)

            for q in questions
        ]
    }

# =========================================================
# GET ALL TOPICS
# =========================================================

def get_all_topics():

    topics = db.questions.distinct(
        "topic"
    )

    topics = sorted(topics)

    return {

        "total_topics":
            len(topics),

        "topics":
            topics
    }

# =========================================================
# BUILD QUERY
# =========================================================

def build_query(filters):

    query = {}

    difficulty = filters.get(
        "difficulty"
    )

    topic = filters.get(
        "topic"
    )

    platform = filters.get(
        "platform"
    )

    tags = filters.get(
        "tags"
    )

    companies = filters.get(
        "companies"
    )

    search = filters.get(
        "search"
    )

    paid_only = filters.get(
        "paid_only"
    )

    # =====================================================
    # DIFFICULTY
    # =====================================================

    if difficulty:

        query["difficulty"] = (
            difficulty.upper()
        )

    # =====================================================
    # TOPIC
    # =====================================================

    if topic:

        query["topic"] = topic

    # =====================================================
    # PLATFORM
    # =====================================================

    if platform:

        query["platform"] = platform

    # =====================================================
    # TAGS
    # =====================================================

    if tags:

        query["tags"] = {
            "$in": tags
        }

    # =====================================================
    # COMPANIES
    # =====================================================

    if companies:

        query["companies"] = {
            "$in": companies
        }

    # =====================================================
    # SEARCH
    # =====================================================

    if search:

        query["$or"] = [

            {
                "title": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "topic": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "tags": {
                    "$regex": search,
                    "$options": "i"
                }
            }
        ]

    # =====================================================
    # PAID ONLY
    # =====================================================

    if paid_only is not None:

        query["paid_only"] = paid_only

    return query

# =========================================================
# GET QUESTION COUNTS
# =========================================================

def get_question_stats():

    total = db.questions.count_documents({})

    easy = db.questions.count_documents({
        "difficulty": "EASY"
    })

    medium = db.questions.count_documents({
        "difficulty": "MEDIUM"
    })

    hard = db.questions.count_documents({
        "difficulty": "HARD"
    })

    topics = len(
        db.questions.distinct("topic")
    )

    platforms = len(
        db.questions.distinct("platform")
    )

    return {

        "total_questions":
            total,

        "difficulty_breakdown": {

            "easy": easy,
            "medium": medium,
            "hard": hard
        },

        "total_topics":
            topics,

        "total_platforms":
            platforms
    }