# =========================================================
# PAGINATION UTILITY
# =========================================================

def paginate(

    page=1,
    limit=20,
    max_limit=100
):

    try:

        page = int(page)

    except:

        page = 1

    try:

        limit = int(limit)

    except:

        limit = 20

    # =====================================================
    # SAFETY CHECKS
    # =====================================================

    if page < 1:

        page = 1

    if limit < 1:

        limit = 20

    if limit > max_limit:

        limit = max_limit

    # =====================================================
    # SKIP CALCULATION
    # =====================================================

    skip = (

        (page - 1)
        * limit
    )

    return {

        "page": page,

        "limit": limit,

        "skip": skip
    }

# =========================================================
# PAGINATION METADATA
# =========================================================

def pagination_meta(

    total_items,
    page,
    limit
):

    total_pages = (

        (total_items + limit - 1)
        // limit
    )

    has_next = (
        page < total_pages
    )

    has_prev = (
        page > 1
    )

    return {

        "page": page,

        "limit": limit,

        "total_items": total_items,

        "total_pages": total_pages,

        "has_next": has_next,

        "has_prev": has_prev
    }