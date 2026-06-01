import requests
import json

def preview_leetcode_graphql_schema():
    print("🛰️  Connecting to LeetCode's live production GraphQL gateway...")
    
    url = "https://leetcode.com/graphql"
    
    # The precise v2 schema query handling the live problemset grid
    graphql_query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
        ) {
            totalNum
            data {
                questionFrontendId
                title
                titleSlug
                difficulty
                isPaidOnly
                acRate
                freqBar
                hasSolution
                hasVideoSolution
                topicTags {
                    name
                    slug
                    id
                }
            }
        }
    }
    """
    
    # Fetching a tiny batch of 2 questions just to extract the structural payload keys safely
    payload = {
        "query": graphql_query,
        "variables": {
            "categorySlug": "all-code-essentials",
            "skip": 0,
            "limit": 2,
            "filters": {}
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://leetcode.com/problemset/all/"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            response_json = response.json()
            
            # Check if there are GraphQL errors
            if "errors" in response_json:
                print("❌ GraphQL Parsing Error encountered:")
                print(json.dumps(response_json["errors"], indent=2))
                return
                
            print("✅ Successfully intercepted live schema structure!")
            print(f"📊 Total code essentials questions discoverable right now: {response_json['data']['problemsetQuestionList']['totalNum']}\n")
            print("👇 Below is the exact JSON structure of a single problem object with all hidden keys unlocked:")
            
            # Print a single problem block cleanly formatted
            sample_problems = response_json['data']['problemsetQuestionList']['data']
            if sample_problems:
                print(json.dumps(sample_problems[0], indent=4))
            else:
                print("⚠️ Connection succeeded but data array returned empty.")
                
        else:
            print(f"❌ Handshake failed. Status Code: {response.status_code}")
            print("Response:", response.text)
            
    except Exception as e:
        print(f"❌ Failed to reach gateway endpoint: {str(e)}")

if __name__ == "__main__":
    preview_leetcode_graphql_schema()