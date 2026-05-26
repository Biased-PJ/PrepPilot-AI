import os
import math
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from datetime import datetime
from bson import ObjectId
from bs4 import BeautifulSoup
from flask import Blueprint, request, jsonify

from config import db
from middleware.auth_middleware import token_required

problems = Blueprint('problems', __name__)

# =========================================================
# CREATE INDEXES
# =========================================================

try:
    db.questions.create_index("slug", unique=True)

    db.user_progress.create_index([
        ("user_email", 1),
        ("question_id", 1)
    ])

except Exception as e:
    print(e)

# =========================================================
# TEST ROUTE
# =========================================================

@problems.route('/test', methods=['GET'])
def test_route():

    return jsonify({
        "message": "Problems API working"
    }), 200

# =========================================================
# ADD QUESTION
# =========================================================

@problems.route('/add-question', methods=['POST'])
@token_required
def add_question():

    data = request.json

    title = data.get('title')

    if not title:

        return jsonify({
            "error": "Title is required"
        }), 400

    slug = title.lower().replace(' ', '-')

    existing_question = db.questions.find_one({
        "slug": slug
    })

    if existing_question:

        return jsonify({
            "message": "Question already exists"
        }), 409

    question = {

        "title": title,

        "slug": slug,

        "topic": data.get('topic', 'General'),

        "difficulty": data.get('difficulty', 'Easy'),

        "platform": data.get('platform', 'LeetCode'),

        "source": data.get('source', 'Manual'),

        "link": data.get('link', ''),

        "companies": data.get('companies', []),

        "tags": data.get('tags', []),

        "created_at": datetime.utcnow()
    }

    result = db.questions.insert_one(question)

    return jsonify({

        "message": "Question added successfully",

        "question_id": str(result.inserted_id)

    }), 201

# =========================================================
# GET ALL QUESTIONS
# =========================================================

@problems.route('/all-questions', methods=['GET'])
@token_required
def get_all_questions():

    questions = []

    for q in db.questions.find():

        q['_id'] = str(q['_id'])

        questions.append(q)

    return jsonify({

        "total_questions": len(questions),

        "questions": questions

    }), 200

# =========================================================
# SOLVE QUESTION
# =========================================================

@problems.route('/solve-question', methods=['POST'])
@token_required
def solve_question():

    data = request.json

    question_id = data.get('question_id')

    if not question_id:

        return jsonify({
            "error": "question_id is required"
        }), 400

    try:

        object_id = ObjectId(question_id)

    except:

        return jsonify({
            "error": "Invalid question id"
        }), 400

    question = db.questions.find_one({
        "_id": object_id
    })

    if not question:

        return jsonify({
            "error": "Question not found"
        }), 404

    existing_progress = db.user_progress.find_one({

        "user_email": request.user['email'],

        "question_id": object_id
    })

    if existing_progress:

        return jsonify({
            "message": "Question already solved"
        }), 409

    progress = {

        "user_email": request.user['email'],

        "question_id": object_id,

        "status": data.get('status', 'Solved'),

        "time_taken": data.get('time_taken', 0),

        "solved_at": datetime.utcnow()
    }

    db.user_progress.insert_one(progress)

    return jsonify({
        "message": "Question solved successfully"
    }), 201

# =========================================================
# MY PROBLEMS
# =========================================================

@problems.route('/my-problems', methods=['GET'])
@token_required
def get_my_problems():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    results = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress['question_id']
        })

        if question:

            results.append({

                "question_id": str(question['_id']),

                "title": question['title'],

                "topic": question['topic'],

                "difficulty": question['difficulty'],

                "platform": question['platform'],

                "companies": question.get('companies', []),

                "status": progress['status'],

                "time_taken": progress['time_taken'],

                "solved_at": progress['solved_at']
            })

    return jsonify({

        "total_solved": len(results),

        "problems": results

    }), 200

# =========================================================
# ANALYTICS
# =========================================================

@problems.route('/analytics', methods=['GET'])
@token_required
def analytics():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    if len(progress_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    merged_data = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress['question_id']
        })

        if question:

            merged_data.append({

                "topic": question['topic'],

                "difficulty": question['difficulty'],

                "time_taken": progress['time_taken']
            })

    df = pd.DataFrame(merged_data)

    topic_distribution = (
        df['topic']
        .value_counts()
        .to_dict()
    )

    difficulty_distribution = (
        df['difficulty']
        .value_counts()
        .to_dict()
    )

    weak_topic = min(
        topic_distribution,
        key=topic_distribution.get
    )

    return jsonify({

        "total_problems": len(df),

        "average_time": round(
            float(np.mean(df['time_taken'])),
            2
        ),

        "topic_distribution": topic_distribution,

        "difficulty_distribution": difficulty_distribution,

        "weak_topic": weak_topic

    }), 200

# =========================================================
# RECOMMENDATIONS
# =========================================================

@problems.route('/recommendations', methods=['GET'])
@token_required
def recommendations():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    if len(progress_data) == 0:

        return jsonify({
            "message": "No solved questions found"
        }), 404

    solved_question_ids = []

    topic_frequency = {}

    for progress in progress_data:

        solved_question_ids.append(
            progress['question_id']
        )

        question = db.questions.find_one({
            "_id": progress['question_id']
        })

        if question:

            topic = question['topic']

            topic_frequency[topic] = (
                topic_frequency.get(topic, 0) + 1
            )

    weak_topic = min(
        topic_frequency,
        key=topic_frequency.get
    )

    recommended_questions = list(

        db.questions.find({

            "topic": weak_topic,

            "_id": {
                "$nin": solved_question_ids
            }

        }).limit(5)

    )

    final_questions = []

    for q in recommended_questions:

        final_questions.append({

            "question_id": str(q['_id']),

            "title": q['title'],

            "difficulty": q['difficulty'],

            "platform": q['platform'],

            "link": q['link']
        })

    return jsonify({

        "weak_topic": weak_topic,

        "recommendations": final_questions

    }), 200

# =========================================================
# STREAK
# =========================================================

@problems.route('/streak', methods=['GET'])
@token_required
def streak():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    if len(progress_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    solve_dates = []

    for progress in progress_data:

        solve_dates.append(
            progress['solved_at'].date()
        )

    unique_dates = sorted(
        list(set(solve_dates))
    )

    if len(unique_dates) == 0:

        return jsonify({
            "message": "No solved dates found"
        }), 404

    current_streak = 1

    for i in range(
        len(unique_dates) - 1,
        0,
        -1
    ):

        diff = (
            unique_dates[i]
            - unique_dates[i - 1]
        ).days

        if diff == 1:
            current_streak += 1

        else:
            break

    return jsonify({

        "current_streak": current_streak,

        "active_days": len(unique_dates)

    }), 200

# =========================================================
# READINESS SCORE
# =========================================================

@problems.route('/readiness-score', methods=['GET'])
@token_required
def readiness_score():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    if len(progress_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    total_problems = len(progress_data)

    medium_count = 0
    hard_count = 0

    topics = set()

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress['question_id']
        })

        if question:

            topics.add(question['topic'])

            if question['difficulty'] == 'Medium':
                medium_count += 1

            if question['difficulty'] == 'Hard':
                hard_count += 1

    problem_score = min(
        math.ceil((total_problems / 400) * 30),
        30
    )

    difficulty_score = min(
        math.ceil((medium_count * 0.2)
        + (hard_count * 0.3)),
        30
    )

    topic_score = min(
        len(topics) * 2,
        30
    )

    final_score = (
        problem_score
        + difficulty_score
        + topic_score
    )

    readiness_level = "Beginner"

    if final_score >= 40:
        readiness_level = "Intermediate"

    if final_score >= 70:
        readiness_level = "Interview Ready"

    return jsonify({

        "interview_readiness_score": final_score,

        "readiness_level": readiness_level

    }), 200

# =========================================================
# COMPANY QUESTIONS
# =========================================================

@problems.route('/company-questions/<company>', methods=['GET'])
@token_required
def company_questions(company):

    questions = list(

        db.questions.find({

            "companies": {
                "$regex": company,
                "$options": "i"
            }

        })

    )

    final_questions = []

    for q in questions:

        final_questions.append({

            "question_id": str(q['_id']),

            "title": q['title'],

            "topic": q['topic'],

            "difficulty": q['difficulty'],

            "platform": q['platform'],

            "companies": q.get('companies', []),

            "link": q['link']
        })

    return jsonify({

        "company": company,

        "total_questions": len(final_questions),

        "questions": final_questions

    }), 200

# =========================================================
# SCRAPE GFG ARRAY QUESTIONS
# =========================================================

@problems.route('/scrape-gfg-arrays', methods=['GET'])
@token_required
def scrape_gfg_arrays():

    url = (
        "https://www.geeksforgeeks.org/"
        "top-50-array-coding-problems-for-interviews/"
    )

    response = requests.get(url)

    if response.status_code != 200:

        return jsonify({
            "error": "Failed to fetch webpage"
        }), 500

    soup = BeautifulSoup(
        response.text,
        'html.parser'
    )

    links = soup.find_all('a')

    inserted_questions = []

    added_titles = set()

    keywords = [
        "array",
        "subarray",
        "sum",
        "search",
        "sort",
        "matrix",
        "rotation",
        "pair",
        "duplicate",
        "majority"
    ]

    for link in links:

        title = link.get_text(strip=True)

        href = link.get('href')

        if (
            title
            and href
            and len(title) > 8
            and "geeksforgeeks.org" in href
            and any(
                keyword in title.lower()
                for keyword in keywords
            )
        ):

            if title in added_titles:
                continue

            added_titles.add(title)

            slug = (
                title
                .lower()
                .replace(' ', '-')
            )

            existing_question = db.questions.find_one({
                "slug": slug
            })

            if existing_question:
                continue

            question = {

                "title": title,

                "slug": slug,

                "topic": "Arrays",

                "difficulty": "Unknown",

                "platform": "GeeksforGeeks",

                "source": "GeeksforGeeks",

                "link": href,

                "companies": [],

                "tags": ["array"],

                "created_at": datetime.utcnow()
            }

            result = db.questions.insert_one(question)

            inserted_questions.append({

                "question_id": str(result.inserted_id),

                "title": title,

                "link": href
            })

        if len(inserted_questions) >= 15:
            break

    return jsonify({

        "message": "Questions scraped successfully",

        "total_questions": len(inserted_questions),

        "questions": inserted_questions

    }), 200

# =========================================================
# SCRAPE GFG ARTICLES
# =========================================================

@problems.route('/scrape-gfg-articles', methods=['GET'])
@token_required
def scrape_gfg_articles():

    url = "https://www.geeksforgeeks.org/data-structures/"

    response = requests.get(url)

    if response.status_code != 200:

        return jsonify({
            "error": "Failed to fetch webpage"
        }), 500

    soup = BeautifulSoup(
        response.text,
        'html.parser'
    )

    headings = soup.find_all('h2')

    articles = []

    for heading in headings[:10]:

        title = heading.get_text(strip=True)

        if len(title) > 0:

            existing_article = db.articles.find_one({
                "title": title
            })

            if existing_article:
                continue

            article = {

                "title": title,

                "source": "GeeksforGeeks",

                "topic": "DSA",

                "created_at": datetime.utcnow()
            }

            db.articles.insert_one(article)

            articles.append({

                "title": article["title"],

                "source": article["source"],

                "topic": article["topic"]
            })

    return jsonify({

        "message": "Articles scraped successfully",

        "total_articles": len(articles),

        "articles": articles

    }), 200

# =========================================================
# GENERATE CHART
# =========================================================

@problems.route('/generate-chart', methods=['GET'])
@token_required
def generate_chart():

    user_email = request.user['email']

    progress_data = list(

        db.user_progress.find({
            "user_email": user_email
        })

    )

    if len(progress_data) == 0:

        return jsonify({
            "message": "No problems found"
        }), 404

    topics = []

    for progress in progress_data:

        question = db.questions.find_one({
            "_id": progress['question_id']
        })

        if question:

            topics.append(question['topic'])

    df = pd.DataFrame({
        "topic": topics
    })

    topic_counts = df['topic'].value_counts()

    plt.figure(figsize=(8, 5))

    topic_counts.plot(kind='bar')

    plt.title('Topic Distribution')

    plt.xlabel('Topics')

    plt.ylabel('Problems Solved')

    safe_email = (
        user_email
        .replace("@", "_")
        .replace(".", "_")
    )

    static_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "static"
    )

    static_dir = os.path.abspath(static_dir)

    os.makedirs(static_dir, exist_ok=True)

    chart_path = os.path.join(
        static_dir,
        f"{safe_email}_topic_chart.png"
    )

    plt.savefig(chart_path)

    plt.close()

    return jsonify({

        "message": "Chart generated successfully",

        "chart_path": chart_path

    }), 200


# =========================================================
# IMPORT LEETCODE QUESTIONS
# =========================================================

import json

@problems.route('/import-leetcode-questions', methods=['GET'])
@token_required
def import_leetcode_questions():

    import json

    url = "https://leetcode.com/graphql"

    query = """

    query problemsetQuestionListV2(
        $categorySlug: String,
        $limit: Int,
        $skip: Int
    ) {

        problemsetQuestionListV2(
            categorySlug: $categorySlug
            limit: $limit
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

    headers = {

        "Content-Type": "application/json",

        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),

        "Referer": "https://leetcode.com",

        "Origin": "https://leetcode.com"
    }

    # ============================================
    # EXISTING SLUGS
    # ============================================

    existing_slugs = set(

        q["slug"]

        for q in db.questions.find(
            {},
            {"slug": 1}
        )

        if "slug" in q
    )

    all_questions_to_insert = []

    total_fetched = 0

    total_skipped = 0

    LIMIT = 100

    # ============================================
    # PAGINATION LOOP
    # ============================================

    for skip in range(0, 4000, LIMIT):

        print(f"Fetching questions {skip} -> {skip + LIMIT}")

        variables = {

            "categorySlug": "",

            "skip": skip,

            "limit": LIMIT
        }

        payload = {

            "query": query,

            "variables": variables
        }

        response = requests.post(

            url,

            json=payload,

            headers=headers
        )

        if response.status_code != 200:

            print("Request failed")

            break

        data = response.json()

        questions_data = (

            data
            .get("data", {})
            .get("problemsetQuestionListV2", {})
            .get("questions", [])
        )

        # No more questions
        if len(questions_data) == 0:

            print("Finished importing")

            break

        total_fetched += len(questions_data)

        for q in questions_data:

            title = q.get("title")

            slug = q.get("titleSlug")

            difficulty = q.get("difficulty")

            ac_rate = q.get("acRate")

            is_paid = q.get("paidOnly")

            if not title or not slug:
                continue

            if slug in existing_slugs:

                total_skipped += 1
                continue

            topic_tags = [

                tag.get("name")

                for tag in q.get("topicTags", [])

                if tag.get("name")
            ]

            question = {

                "title": title,

                "slug": slug,

                "topic": (
                    topic_tags[0]
                    if len(topic_tags) > 0
                    else "General"
                ),

                "difficulty": difficulty,

                "platform": "LeetCode",

                "source": "LeetCode",

                "link":
                    f"https://leetcode.com/problems/{slug}/",

                "companies": [],

                "tags": topic_tags,

                "acceptance_rate": round(ac_rate, 2)
                    if ac_rate else None,

                "paid_only": is_paid,

                "created_at": datetime.utcnow()
            }

            all_questions_to_insert.append(question)

            existing_slugs.add(slug)

    # ============================================
    # BULK INSERT
    # ============================================

    inserted_count = 0

    if len(all_questions_to_insert) > 0:

        from pymongo.errors import BulkWriteError

        before_count = db.questions.count_documents({})

        try:

            db.questions.insert_many(
                all_questions_to_insert,
                ordered=False
            )

        except BulkWriteError:
            pass

        after_count = db.questions.count_documents({})

        inserted_count = after_count - before_count

    return jsonify({

        "message":
            "Full LeetCode dataset imported successfully",

        "total_fetched":
            total_fetched,

        "inserted":
            inserted_count,

        "skipped":
            total_skipped,

        "database_total":
            db.questions.count_documents({})
    }), 200