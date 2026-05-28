import jwt

from datetime import (

    datetime,

    timedelta
)

from config import JWT_SECRET_KEY

# =========================================================
# GENERATE JWT TOKEN
# =========================================================

def generate_token(

    email,
    expires_in_days=7
):

    payload = {

        "email": email,

        "exp":
            datetime.utcnow()
            + timedelta(days=expires_in_days),

        "iat":
            datetime.utcnow()
    }

    token = jwt.encode(

        payload,

        JWT_SECRET_KEY,

        algorithm="HS256"
    )

    # PyJWT compatibility
    if isinstance(token, bytes):

        token = token.decode("utf-8")

    return token

# =========================================================
# VERIFY / DECODE TOKEN
# =========================================================

def decode_token(token):

    try:

        payload = jwt.decode(

            token,

            JWT_SECRET_KEY,

            algorithms=["HS256"]
        )

        return {

            "success": True,

            "data": payload
        }

    except jwt.ExpiredSignatureError:

        return {

            "success": False,

            "message": "Token expired"
        }

    except jwt.InvalidTokenError:

        return {

            "success": False,

            "message": "Invalid token"
        }

# =========================================================
# EXTRACT TOKEN FROM HEADER
# =========================================================

def extract_token(auth_header):

    if not auth_header:

        return None

    if not auth_header.startswith("Bearer "):

        return None

    return auth_header.split(" ")[1]