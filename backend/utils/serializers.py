from bson import ObjectId
from datetime import datetime

# =========================================================
# SERIALIZE SINGLE DOCUMENT
# =========================================================

def serialize_doc(doc):

    if not doc:

        return None

    serialized = {}

    for key, value in doc.items():

        # =================================================
        # OBJECT ID
        # =================================================

        if isinstance(value, ObjectId):

            serialized[key] = str(value)

        # =================================================
        # DATETIME
        # =================================================

        elif isinstance(value, datetime):

            serialized[key] = value.isoformat()

        # =================================================
        # NORMAL VALUE
        # =================================================

        else:

            serialized[key] = value

    return serialized

# =========================================================
# SERIALIZE LIST OF DOCUMENTS
# =========================================================

def serialize_list(docs):

    return [

        serialize_doc(doc)

        for doc in docs
    ]

# =========================================================
# SERIALIZE PAGINATED DATA
# =========================================================

def serialize_paginated(

    docs,
    total,
    page,
    limit
):

    total_pages = (

        (total + limit - 1)
        // limit
    )

    return {

        "page": page,

        "limit": limit,

        "total": total,

        "total_pages": total_pages,

        "items": serialize_list(docs)
    }