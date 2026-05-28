from functools import wraps

from flask import request, jsonify

# =========================================================
# ADMIN REQUIRED DECORATOR
# =========================================================

def admin_required(route_function):

    @wraps(route_function)
    def wrapper(*args, **kwargs):

        # =================================================
        # CHECK USER EXISTS
        # =================================================

        if not hasattr(request, "user"):

            return jsonify({

                "success": False,

                "message":
                    "Authentication required"

            }), 401

        # =================================================
        # CHECK ADMIN ROLE
        # =================================================

        user_role = request.user.get(
            "role",
            "user"
        )

        if user_role != "admin":

            return jsonify({

                "success": False,

                "message":
                    "Admin access required"

            }), 403

        # =================================================
        # EXECUTE ROUTE
        # =================================================

        return route_function(
            *args,
            **kwargs
        )

    return wrapper