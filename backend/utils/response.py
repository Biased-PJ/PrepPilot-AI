# =========================================================
# SUCCESS RESPONSE
# =========================================================

def success_response(

    data=None,
    message="Success",
    status=200
):

    return {

        "success": True,

        "message": message,

        "status": status,

        "data": data
    }

# =========================================================
# ERROR RESPONSE
# =========================================================

def error_response(

    message="Error",
    status=400,
    errors=None
):

    return {

        "success": False,

        "message": message,

        "status": status,

        "errors": errors
    }

# =========================================================
# PAGINATED RESPONSE
# =========================================================

def paginated_response(

    items,
    page,
    limit,
    total,
    message="Data fetched successfully"
):

    total_pages = (

        (total + limit - 1)
        // limit
    )

    return {

        "success": True,

        "message": message,

        "status": 200,

        "pagination": {

            "page": page,

            "limit": limit,

            "total": total,

            "total_pages": total_pages
        },

        "data": items
    }

# =========================================================
# CREATED RESPONSE
# =========================================================

def created_response(

    data=None,
    message="Created successfully"
):

    return {

        "success": True,

        "message": message,

        "status": 201,

        "data": data
    }

# =========================================================
# UNAUTHORIZED RESPONSE
# =========================================================

def unauthorized_response(

    message="Unauthorized"
):

    return {

        "success": False,

        "message": message,

        "status": 401
    }

# =========================================================
# NOT FOUND RESPONSE
# =========================================================

def not_found_response(

    message="Resource not found"
):

    return {

        "success": False,

        "message": message,

        "status": 404
    }

# =========================================================
# SERVER ERROR RESPONSE
# =========================================================

def server_error_response(

    message="Internal server error"
):

    return {

        "success": False,

        "message": message,

        "status": 500
    }