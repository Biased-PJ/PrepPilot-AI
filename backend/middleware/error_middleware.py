from flask import jsonify

from pymongo.errors import (

    DuplicateKeyError,

    PyMongoError
)

import jwt

# =========================================================
# REGISTER GLOBAL ERROR HANDLERS
# =========================================================

def register_error_handlers(app):

    # =====================================================
    # 404 NOT FOUND
    # =====================================================

    @app.errorhandler(404)
    def not_found_error(error):

        return jsonify({

            "success": False,

            "message":
                "Route not found"

        }), 404

    # =====================================================
    # 405 METHOD NOT ALLOWED
    # =====================================================

    @app.errorhandler(405)
    def method_not_allowed(error):

        return jsonify({

            "success": False,

            "message":
                "Method not allowed"

        }), 405

    # =====================================================
    # JWT EXPIRED
    # =====================================================

    @app.errorhandler(jwt.ExpiredSignatureError)
    def jwt_expired(error):

        return jsonify({

            "success": False,

            "message":
                "Token expired"

        }), 401

    # =====================================================
    # JWT INVALID
    # =====================================================

    @app.errorhandler(jwt.InvalidTokenError)
    def jwt_invalid(error):

        return jsonify({

            "success": False,

            "message":
                "Invalid token"

        }), 401

    # =====================================================
    # DUPLICATE KEY ERROR
    # =====================================================

    @app.errorhandler(DuplicateKeyError)
    def duplicate_key_error(error):

        return jsonify({

            "success": False,

            "message":
                "Duplicate data found"

        }), 409

    # =====================================================
    # DATABASE ERROR
    # =====================================================

    @app.errorhandler(PyMongoError)
    def pymongo_error(error):

        return jsonify({

            "success": False,

            "message":
                "Database error occurred"

        }), 500

    # =====================================================
    # GENERAL EXCEPTION
    # =====================================================

    @app.errorhandler(Exception)
    def internal_server_error(error):

        print("ERROR:", error)

        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500