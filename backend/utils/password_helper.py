import bcrypt

# =========================================================
# HASH PASSWORD
# =========================================================

def hash_password(password):

    hashed = bcrypt.hashpw(

        password.encode("utf-8"),

        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")

# =========================================================
# VERIFY PASSWORD
# =========================================================

def verify_password(

    password,
    hashed_password
):

    return bcrypt.checkpw(

        password.encode("utf-8"),

        hashed_password.encode("utf-8")
    )

# =========================================================
# PASSWORD STRENGTH CHECK
# =========================================================

def is_strong_password(password):

    if len(password) < 6:

        return False

    has_upper = any(
        char.isupper()
        for char in password
    )

    has_lower = any(
        char.islower()
        for char in password
    )

    has_digit = any(
        char.isdigit()
        for char in password
    )

    return (

        has_upper and

        has_lower and

        has_digit
    )