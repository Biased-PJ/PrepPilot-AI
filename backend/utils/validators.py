import re

# =========================================================
# EMAIL VALIDATION
# =========================================================

def validate_email(email):

    if not isinstance(email, str):

        return False

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    return re.match(
        pattern,
        email
    ) is not None

# =========================================================
# PASSWORD VALIDATION
# =========================================================

def validate_password(password):

    if not isinstance(password, str):

        return False

    return len(password) >= 6

# =========================================================
# USERNAME VALIDATION
# =========================================================

def validate_username(username):

    if not isinstance(username, str):

        return False

    return (

        len(username.strip()) >= 3
        and
        len(username.strip()) <= 30
    )

# =========================================================
# REQUIRED FIELDS VALIDATION
# =========================================================

def validate_required_fields(

    data,
    required_fields
):

    missing_fields = []

    for field in required_fields:

        value = data.get(field)

        if value is None:

            missing_fields.append(field)

        elif isinstance(value, str):

            if value.strip() == "":

                missing_fields.append(field)

    return missing_fields

# =========================================================
# OBJECT ID VALIDATION
# =========================================================

def validate_object_id(object_id):

    from bson import ObjectId

    try:

        ObjectId(object_id)

        return True

    except:

        return False

# =========================================================
# POSITIVE NUMBER VALIDATION
# =========================================================

def validate_positive_number(value):

    try:

        return float(value) >= 0

    except:

        return False

# =========================================================
# PAGINATION VALIDATION
# =========================================================

def validate_pagination(

    page,
    limit
):

    try:

        page = int(page)

        limit = int(limit)

        return (

            page > 0
            and
            limit > 0
        )

    except:

        return False