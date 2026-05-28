import time
from flask import request

# =========================================================
# REQUEST LOGGER MIDDLEWARE
# =========================================================

def register_request_logger(app):

    # =====================================================
    # BEFORE REQUEST
    # =====================================================

    @app.before_request
    def log_request_start():

        request.start_time = time.time()

        print("\n================ REQUEST ================")

        print(f"Method: {request.method}")

        print(f"Path: {request.path}")

        print(f"IP: {request.remote_addr}")

        print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")

        # ================================================
        # OPTIONAL USER INFO
        # ================================================

        if hasattr(request, "user"):

            print(
                f"User: "
                f"{request.user.get('email')}"
            )

    # =====================================================
    # AFTER REQUEST
    # =====================================================

    @app.after_request
    def log_request_end(response):

        duration = round(

            time.time()
            - request.start_time,

            4
        )

        print(f"Status: {response.status_code}")

        print(f"Response Time: {duration}s")

        print("=========================================\n")

        return response