from datetime import datetime

from config import db

from utils.password_helper import (

    hash_password,

    verify_password
)

from utils.jwt_helper import (
    
    generate_token
)

from utils.validators import (

    validate_email,

    validate_password,

    validate_required_fields
)

# =========================================================
# CREATE USER
# =========================================================

def create_user(data):

    # =====================================================
    # VALIDATE REQUIRED FIELDS
    # =====================================================

    required_fields = [

        "name",

        "email",

        "password"
    ]

    missing_fields = validate_required_fields(

        data,

        required_fields
    )

    if missing_fields:

        return {

            "success": False,

            "message":
                f"Missing fields: {', '.join(missing_fields)}"
        }

    name = data.get("name").strip()

    email = data.get("email").strip().lower()

    password = data.get("password")

    # =====================================================
    # VALIDATE EMAIL
    # =====================================================

    if not validate_email(email):

        return {

            "success": False,

            "message":
                "Invalid email format"
        }

    # =====================================================
    # VALIDATE PASSWORD
    # =====================================================

    if not validate_password(password):

        return {

            "success": False,

            "message":
                "Password must be at least 6 characters"
        }

    # =====================================================
    # CHECK EXISTING USER
    # =====================================================

    existing_user = db.users.find_one({

        "email": email
    })

    if existing_user:

        return {

            "success": False,

            "message":
                "User already exists"
        }

    # =====================================================
    # HASH PASSWORD
    # =====================================================

    hashed_password = hash_password(password)

    # =====================================================
    # CREATE USER DOCUMENT
    # =====================================================

    user = {

        "name": name,

        "email": email,

        "password": hashed_password,

        "role": "user",

        "created_at": datetime.utcnow()
    }

    result = db.users.insert_one(user)

    # =====================================================
    # GENERATE JWT TOKEN
    # =====================================================

    token = generate_token(email)

    return {

        "success": True,

        "message":
            "User created successfully",

        "user": {

            "id": str(result.inserted_id),

            "name": name,

            "email": email
        },

        "token": token
    }

# =========================================================
# LOGIN USER
# =========================================================

def login_user(data):

    # =====================================================
    # VALIDATE REQUIRED FIELDS
    # =====================================================

    required_fields = [

        "email",

        "password"
    ]

    missing_fields = validate_required_fields(

        data,

        required_fields
    )

    if missing_fields:

        return {

            "success": False,

            "message":
                f"Missing fields: {', '.join(missing_fields)}"
        }

    email = data.get("email").strip().lower()

    password = data.get("password")

    # =====================================================
    # FIND USER
    # =====================================================

    user = db.users.find_one({

        "email": email
    })

    if not user:

        return {

            "success": False,

            "message":
                "User not found"
        }

    # =====================================================
    # VERIFY PASSWORD
    # =====================================================

    is_valid = verify_password(

        password,

        user["password"]
    )

    if not is_valid:

        return {

            "success": False,

            "message":
                "Invalid password"
        }

    # =====================================================
    # GENERATE TOKEN
    # =====================================================

    token = generate_token(email)

    return {

        "success": True,

        "message":
            "Login successful",

        "token": token,

        "user": {

            "id": str(user["_id"]),

            "name": user.get("name"),

            "email": user.get("email"),

            "role": user.get(
                "role",
                "user"
            )
        }
    }

# =========================================================
# GET USER PROFILE
# =========================================================

def get_user_profile(user_email):

    user = db.users.find_one({

        "email": user_email
    })

    if not user:

        return {

            "success": False,

            "message":
                "User not found"
        }

    return {

        "success": True,

        "user": {

            "id": str(user["_id"]),

            "name": user.get("name"),

            "email": user.get("email"),

            "role": user.get(
                "role",
                "user"
            ),

            "created_at":
                user.get("created_at")
        }
    }

# =========================================================
# UPDATE PASSWORD
# =========================================================

def update_password(

    user_email,
    old_password,
    new_password
):

    user = db.users.find_one({

        "email": user_email
    })

    if not user:

        return {

            "success": False,

            "message":
                "User not found"
        }

    # =====================================================
    # VERIFY OLD PASSWORD
    # =====================================================

    valid_old_password = verify_password(

        old_password,

        user["password"]
    )

    if not valid_old_password:

        return {

            "success": False,

            "message":
                "Old password incorrect"
        }

    # =====================================================
    # VALIDATE NEW PASSWORD
    # =====================================================

    if not validate_password(new_password):

        return {

            "success": False,

            "message":
                "New password too weak"
        }

    # =====================================================
    # HASH NEW PASSWORD
    # =====================================================

    hashed_password = hash_password(
        new_password
    )

    # =====================================================
    # UPDATE DATABASE
    # =====================================================

    db.users.update_one(

        {
            "email": user_email
        },

        {
            "$set": {

                "password":
                    hashed_password,

                "updated_at":
                    datetime.utcnow()
            }
        }
    )

    return {

        "success": True,

        "message":
            "Password updated successfully"
    }