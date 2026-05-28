│
├── app.py
├── config.py
│
├── routes/
│   ├── auth.py
│   ├── problems.py
│   ├── leetcode.py
│   ├── codeforces.py
│   └── codechef.py
│
├── services/
│   ├── analytics_service.py
│   ├── recommendation_service.py
│   ├── readiness_service.py
│   ├── question_service.py
│   ├── progress_service.py
│   ├── leaderboard_service.py
│   ├── chart_service.py
│   ├── import_service.py
│   ├── leetcode_service.py
│   ├── codeforces_service.py
│   └── codechef_service.py
│
├── utils/
│   ├── serializers.py
│   ├── validators.py
│   ├── helpers.py
│   ├── constants.py
│   ├── responses.py
│   └── logger.py
│
├── middleware/
│   └── auth_middleware.py
│
└── static/


services/
│
├── analytics_service.py
├── readiness_service.py
├── recommendation_service.py
├── streak_service.py
├── topic_service.py
├── unified_profile.py
├── user_progress_service.py
├── question_service.py
├── leaderboard_service.py
├── chart_service.py
├── import_service.py
│
├── leetcode_service.py
├── codeforces_service.py
├── codechef_service.py
├── platform_sync_service.py
│
├── ai_service.py
├── roadmap_service.py
├── prediction_service.py
├── similar_question_service.py
│
├── contest_service.py
├── goal_service.py
├── achievement_service.py
├── revision_service.py
├── scheduler_service.py
│
├── export_service.py
├── notification_service.py
└── cache_service.py


routes/
│
├── auth.py
├── problems.py
│
├── leetcode.py
├── codeforces.py
├── codechef.py
├── sync.py
│
├── dashboard.py
├── analytics.py
├── recommendations.py
│
├── ai.py
├── contest.py
├── goals.py
├── achievements.py
│
└── admin.py


utils/
│
├── jwt_helper.py
├── validators.py
├── response.py
├── constants.py
├── difficulty_mapper.py
├── rating_mapper.py
├── date_helper.py
└── platform_normalizer.py


middleware/
│
├── auth_middleware.py
├── admin_middleware.py
├── error_middleware.py
├── rate_limit_middleware.py
└── request_logger.py