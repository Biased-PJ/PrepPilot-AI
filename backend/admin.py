import time
import requests
from flask import Blueprint, jsonify
from config import db

admin_bp = Blueprint('admin', __name__)

def fetch_leetcode_page(skip, limit=100):
    url = "https://leetcode.com/graphql"
    graphql_query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
            totalNum
            data {
                questionFrontendId
                title
                titleSlug
                difficulty
                isPaidOnly
                acRate
                topicTags {
                    name
                }
            }
        }
    }
    """
    payload = {
        "query": graphql_query,
        "variables": {
            "categorySlug": "all-code-essentials",
            "skip": skip,
            "limit": limit,
            "filters": {}
        }
    }
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code == 200:
            return response.json().get("data", {}).get("problemsetQuestionList", {})
    except Exception:
        return None

@admin_bp.route('/api/admin/trigger-leetcode-sync', methods=['POST'])
def trigger_leetcode_sync():
    print("🛰️  LeetCode sync triggered from Postman...")
    skip = 0
    limit = 100
    inserted_count = 0
    
    try:
        # This is where it crashes if your IP isn't whitelisted or db is disconnected
        existing_ids = set(doc["_id"] for doc in db.questions.find({}, {"_id": 1}))
        print(f"📦 Established database connection. Found {len(existing_ids)} existing questions.")
    except Exception as db_err:
        print(f"❌ DATABASE ERROR ON STARTUP: {str(db_err)}")
        return jsonify({
            "success": False,
            "message": f"Database error occurred: {str(db_err)}"
        }), 500
    
    while True:
        result_data = fetch_leetcode_page(skip, limit)
        if not result_data:
            print("⚠️ Stopped fetching: Failed to receive data from LeetCode API.")
            break
            
        total_questions = result_data.get("totalNum", 4000)
        raw_questions = result_data.get("data", [])
        
        if not raw_questions:
            print("🏁 Reached the end of the question list.")
            break
            
        bulk_batch = []
        for q in raw_questions:
            question_id = str(q.get("questionFrontendId"))
            if question_id in existing_ids:
                continue
                
            tags = [tag.get("name") for tag in q.get("topicTags", []) if tag.get("name")]
            
            bulk_batch.append({
                "_id": question_id,
                "title": q.get("title"),
                "title_slug": q.get("titleSlug"),
                "slug": q.get("titleSlug"),  # 👈 ADD THIS LINE to satisfy the unique slug_1 index constraint!
                "difficulty": q.get("difficulty", "Easy").upper(),
                "paid_only": q.get("isPaidOnly", False),
                "acceptance_rate": round(q.get("acRate", 0.0), 2),
                "topic": tags[0] if tags else "General",
                "tags": tags
            })
            existing_ids.add(question_id)
            
        if bulk_batch:
            try:
                db.questions.insert_many(bulk_batch)
                inserted_count += len(bulk_batch)
            except Exception as insert_err:
                print(f"❌ Error during batch insertion: {str(insert_err)}")
                return jsonify({"success": False, "message": f"Insertion failed: {str(insert_err)}"}), 500
            
        skip += limit
        print(f"📊 Running background worker progress: {skip}/{total_questions} items synced.")
        
        if skip >= total_questions:
            break
            
        time.sleep(0.5)
        
    return jsonify({
        "success": True,
        "message": f"Sync pipeline run finished successfully! Added {inserted_count} new unique questions."
    }), 200


def sync_codeforces_submissions(user_email, cf_handle):
    print(f"🔄 Starting Codeforces sync for {cf_handle} ({user_email})...")
    
    # 1. Fetch data from the official Codeforces API
    url = f"https://codeforces.com/api/user.status?handle={cf_handle}"
    
    try:
        response = requests.get(url, timeout=15)
        data = response.json()
    except Exception as e:
        print(f"❌ Failed to connect to Codeforces API: {str(e)}")
        return False

    if data.get("status") != "OK":
        print(f"❌ Codeforces API Error: {data.get('comment', 'Unknown error')}")
        return False

    submissions = data.get("result", [])
    print(f"📥 Retrieved {len(submissions)} total submissions from API.")

    saved_count = 0
    duplicate_count = 0

    # 2. Iterate and process each submission record
    for sub in submissions:
        # We only care about questions you actually passed successfully
        if sub.get("verdict") != "OK":
            continue

        problem = sub.get("problem", {})
        contest_id = problem.get("contestId")
        index = problem.get("index")  # e.g., 'A', 'B', 'C1'
        
        # Build a safe unique key combining contest id and string index
        if not contest_id or not index:
            continue
        problem_id = f"{contest_id}-{index}"

        # Cleanly extract problem metadata
        title = problem.get("name", "Unknown Problem")
        rating = problem.get("rating")  # Can be None/null for unrated or gym problems
        tags = problem.get("tags", [])
        
        # Convert API timestamp (seconds) to standard Python datetime object
        creation_time_seconds = sub.get("creationTimeSeconds")

        # 3. Upsert into MongoDB
        # Using update_one with upsert=True prevents duplicate rows if run multiple times
        result = db.user_submissions.update_one(
            {
                "user_email": user_email,
                "platform": "codeforces",
                "problem_id": problem_id
            },
            {
                "$set": {
                    "title": title,
                    "rating": rating,
                    "tags": tags,
                    "verdict": "OK",
                    "timestamp": creation_time_seconds
                }
            },
            upsert=True
        )

        if result.upserted_id or result.modified_count > 0:
            saved_count += 1
        else:
            duplicate_count += 1

    print(f"✅ Sync complete! Stored {saved_count} new entries. ({duplicate_count} duplicates skipped).")
    return True