from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta

# =========================================================
# SIMPLE IN-MEMORY RATE LIMIT STORE
# =========================================================

request_logs = {}

# =========================================================
# RATE LIMIT DECORATOR
# =========================================================

def rate_limit(

    max_requests=20,
    window_seconds=60
):

    def decorator(route_function):

        @wraps(route_function)
        def wrapper(*args, **kwargs):

            # =============================================
            # IDENTIFY CLIENT
            # =============================================

            client_ip = request.remote_addr

            now = datetime.utcnow()

            window_start = (
                now -
                timedelta(seconds=window_seconds)
            )

            # =============================================
            # INITIALIZE USER LOGS
            # =============================================

            if client_ip not in request_logs:

                request_logs[client_ip] = []

            # =============================================
            # REMOVE OLD REQUESTS
            # =============================================

            request_logs[client_ip] = [

                timestamp

                for timestamp
                in request_logs[client_ip]

                if timestamp > window_start
            ]

            # =============================================
            # CHECK LIMIT
            # =============================================

            if len(request_logs[client_ip]) >= max_requests:

                return jsonify({

                    "success": False,

                    "message":
                        "Rate limit exceeded",

                    "retry_after_seconds":
                        window_seconds

                }), 429

            # =============================================
            # ADD NEW REQUEST
            # =============================================

            request_logs[client_ip].append(now)

            # =============================================
            # EXECUTE ROUTE
            # =============================================

            return route_function(
                *args,
                **kwargs
            )

        return wrapper

    return decorator