from django.db import transaction
from django.db.models import Max
from .models import Document, DocumentCategory, DocumentNature

def generate_document_code(category_code, nature_code, parent_code=None):
    """
    Generate unique document code with duplicate checking.

    For Process/Procedure (6 chars): XX-YY-ZZ
    For Work Instructions/Records (10 chars): XX-YY-ZZ-AA-BB

    Args:
        category_code: 2-letter category (RH, MT, AC, GD)
        nature_code: 2-letter nature (PR, PS, IT, EQ, FI)
        parent_code: Parent document code for IT/EQ/FI (optional)

    Returns:
        str: Generated unique document code

    Raises:
        ValueError: If invalid parameters or generation fails
    """
    from .models import Document

    # Validate inputs
    if not (category_code and len(category_code) == 2):
        raise ValueError("Invalid category_code")
    if not (nature_code and len(nature_code) == 2):
        raise ValueError("Invalid nature_code")

    is_child = nature_code in ("IT", "EQ", "FI")
    if is_child and not parent_code:
        raise ValueError("Parent code required for IT/EQ/FI")
    if not is_child and parent_code:
        raise ValueError("Parent code should not be provided for PR/PS")

    with transaction.atomic():
        if is_child:
            # Parent code is required, sequential number is for child
            prefix = f"{parent_code}"
            # Find next sequential number for this parent
            children = Document.objects.filter(doc_code__startswith=prefix + "-")
            max_seq = 0
            for doc in children:
                parts = doc.doc_code.split("-")
                if len(parts) >= 5:
                    try:
                        seq = int(parts[4])
                        if seq > max_seq:
                            max_seq = seq
                    except Exception:
                        continue
            next_seq = max_seq + 1
            if next_seq > 99:
                raise ValueError("Maximum sequential number reached for this parent")
            seq_str = f"{next_seq:02d}"
            code = f"{prefix}-{seq_str}"
        else:
            # PR/PS: XX-YY-ZZ
            # Find next sequential number for this category/nature
            prefix = f"{category_code}-{nature_code}"
            docs = Document.objects.filter(doc_code__startswith=prefix)
            max_seq = 0
            for doc in docs:
                parts = doc.doc_code.split("-")
                if len(parts) >= 3:
                    try:
                        seq = int(parts[2])
                        if seq > max_seq:
                            max_seq = seq
                    except Exception:
                        continue
            next_seq = max_seq + 1
            if next_seq > 99:
                raise ValueError("Maximum sequential number reached for this category/nature")
            seq_str = f"{next_seq:02d}"
            code = f"{prefix}-{seq_str}"

        # Check uniqueness
        if Document.objects.filter(doc_code=code).exists():
            raise ValueError("Generated code already exists")
        return code

def validate_document_code(code):
    """
    Validate code format against ISMS rules.
    """
    import re
    # PR/PS: XX-YY-ZZ
    # IT/EQ/FI: XX-YY-ZZ-AA-BB
    pattern1 = r"^[A-Z]{2}-[A-Z]{2}-\d{2}$"
    pattern2 = r"^[A-Z]{2}-[A-Z]{2}-\d{2}-\d{2}$"
    if re.match(pattern1, code) or re.match(pattern2, code):
        return True
    return False

def get_next_sequential_number(category, nature, parent=None):
    """
    Get next available sequential number for a category/nature combination.
    """
    from .models import Document
    if nature.code in ("IT", "EQ", "FI"):
        if not parent:
            raise ValueError("Parent required for IT/EQ/FI")
        prefix = f"{parent.doc_code}"
        children = Document.objects.filter(doc_code__startswith=prefix + "-")
        max_seq = 0
        for doc in children:
            parts = doc.doc_code.split("-")
            if len(parts) >= 4:
                try:
                    seq = int(parts[3])
                    if seq > max_seq:
                        max_seq = seq
                except Exception:
                    continue
        return max_seq + 1
    else:
        prefix = f"{category.code}-{nature.code}"
        docs = Document.objects.filter(doc_code__startswith=prefix)
        max_seq = 0
        for doc in docs:
            parts = doc.doc_code.split("-")
            if len(parts) >= 3:
                try:
                    seq = int(parts[2])
                    if seq > max_seq:
                        max_seq = seq
                except Exception:
                    continue
        return max_seq + 1