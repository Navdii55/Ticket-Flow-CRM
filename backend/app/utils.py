"""
utils.py
--------
Generic, reusable helper functions with no database access and no
business logic tied to a specific entity. Anything here should be
usable in isolation and testable without a database session.

Contrast with services/: services decide WHAT should happen and WHY
(e.g. "does this ticket exist?"); utils.py provides small, stateless
building blocks that services compose together.
"""

from datetime import datetime, timezone

from fastapi import HTTPException, status

# Statuses accepted by validate_status(). Kept here (rather than
# importing schemas.TicketStatus) so this module has zero dependencies
# on the rest of the app, per the "generic and reusable" requirement.
VALID_STATUSES = {"Open", "In Progress", "Closed"}

TICKET_ID_PREFIX = "TKT-"
TICKET_ID_PADDING = 4  # TKT-0001, TKT-0002, ...


def generate_ticket_id(sequence_number: int) -> str:
    """
    Formats a sequence number into a padded ticket_id string.

    Takes the next numeric value as input rather than looking it up
    itself — this file does no database work, so the caller (the
    service layer) is responsible for determining sequence_number
    (e.g. from the last ticket's id) and this function only handles
    the formatting rule: TKT-0001, TKT-0002, ...

    Example:
        generate_ticket_id(1)   -> "TKT-0001"
        generate_ticket_id(42)  -> "TKT-0042"
    """
    return f"{TICKET_ID_PREFIX}{str(sequence_number).zfill(TICKET_ID_PADDING)}"


def get_current_timestamp() -> datetime:
    """
    Returns the current UTC time as a timezone-aware datetime.
    Reusable anywhere a fresh timestamp is needed for created_at or
    updated_at, instead of scattering datetime.now(timezone.utc)
    calls across the codebase.
    """
    return datetime.now(timezone.utc)


def validate_status(value: str) -> str:
    """
    Validates that `value` is one of the allowed ticket statuses
    (Open, In Progress, Closed). Returns the value unchanged if valid;
    raises HTTP 400 otherwise.

    This is a pure validation helper — it doesn't know about tickets,
    the database, or Pydantic models, so it can be called from a
    service function regardless of where the raw status string came
    from (query param, request body field, etc.).
    """
    if value not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{value}'. Must be one of: {sorted(VALID_STATUSES)}.",
        )
    return value


def build_pagination(page: int, page_size: int) -> tuple[int, int]:
    """
    Converts (page, page_size) into (limit, offset) for use in a
    SQLAlchemy .limit()/.offset() query, so this arithmetic isn't
    duplicated wherever pagination is needed.

    Example:
        build_pagination(page=1, page_size=10) -> (10, 0)
        build_pagination(page=3, page_size=10) -> (10, 20)
    """
    limit = page_size
    offset = (page - 1) * page_size
    return limit, offset
