"""
services/ticket_service.py
---------------------------
Business logic layer for tickets. This is where the actual "rules" of
the application live:

- how ticket_ids are generated (TKT-001, TKT-002, ...)
- what the default status is
- which fields are sortable
- what happens when a ticket is not found
- orchestrating one or more crud/ calls into a single meaningful
  operation, then shaping the result into a Pydantic schema

Routes call INTO this module and never touch crud/ or models.py
directly. This keeps ticket_routes.py a thin HTTP adapter.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import ticket_crud
from app.models import Ticket
from app.utils import generate_ticket_id, TICKET_ID_PREFIX
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    TicketOut,
    TicketDetailOut,
    TicketListResponse,
    NoteOut,
)

# Columns the API is allowed to sort by. Whitelisting prevents an
# arbitrary/unsafe value being passed to getattr(Ticket, sort_by)
# in the crud layer.
ALLOWED_SORT_FIELDS = {"created_at", "updated_at", "status", "customer_name", "subject"}


def _generate_next_ticket_id(db: Session) -> str:
    """
    Determines the next sequential ticket NUMBER based on the highest
    existing ticket_id, then delegates the actual TKT-000X formatting
    to utils.generate_ticket_id() — this function's only job is
    figuring out *which number* comes next; utils.py owns the format.

    Parsing the numeric suffix off the last ticket (rather than using
    the internal auto-increment id) keeps ticket_id independent of the
    primary key, so this logic still works if internal ids are ever
    reset, migrated, or offset.
    """
    last_ticket = ticket_crud.get_last_ticket(db)
    if last_ticket is None:
        next_number = 1
    else:
        # e.g. "TKT-0007" -> 7
        last_number_str = last_ticket.ticket_id.replace(TICKET_ID_PREFIX, "")
        try:
            next_number = int(last_number_str) + 1
        except ValueError:
            # Defensive fallback in case ticket_id was ever malformed —
            # never crash ticket creation over a formatting issue.
            next_number = last_ticket.id + 1

    return generate_ticket_id(next_number)


def create_ticket(db: Session, payload: TicketCreate) -> TicketOut:
    """
    Creates a new ticket with an auto-generated ticket_id and the
    default 'Open' status. Timestamps are handled by the model layer.
    """
    new_ticket = Ticket(
        ticket_id=_generate_next_ticket_id(db),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        subject=payload.subject,
        description=payload.description,
        status="Open",  # default status per business rules
    )
    created = ticket_crud.create_ticket(db, new_ticket)
    return TicketOut.model_validate(created)


def get_ticket_detail(db: Session, ticket_id: str) -> TicketDetailOut:
    """
    Fetches a single ticket with its full note history.
    Raises 404 if the ticket_id doesn't exist.
    """
    ticket = ticket_crud.get_ticket_by_ticket_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )
    return TicketDetailOut(
        **TicketOut.model_validate(ticket).model_dump(),
        notes=[NoteOut.model_validate(n) for n in ticket.notes],
    )


def list_tickets(
    db: Session,
    search: Optional[str],
    status_filter: Optional[str],
    sort_by: str,
    sort_order: str,
    page: int,
    page_size: int,
) -> TicketListResponse:
    """
    Validates query parameters and delegates to crud.list_tickets,
    then wraps the result in a paginated response schema.
    """
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort_by field. Allowed values: {sorted(ALLOWED_SORT_FIELDS)}",
        )

    if sort_order not in {"asc", "desc"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="sort_order must be 'asc' or 'desc'.",
        )

    if page < 1 or page_size < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="page and page_size must be positive integers.",
        )

    tickets, total = ticket_crud.list_tickets(
        db,
        search=search,
        status=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )

    return TicketListResponse(
        total=total,
        page=page,
        page_size=page_size,
        tickets=[TicketOut.model_validate(t) for t in tickets],
    )


def update_ticket(db: Session, ticket_id: str, payload: TicketUpdate) -> TicketDetailOut:
    """
    Applies a partial update to ticket-level fields: status, subject,
    and/or description. At least one field must be provided. Notes are
    NOT handled here — see services/note_service.py for note creation.
    """
    if payload.status is None and payload.subject is None and payload.description is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one of 'status', 'subject', or 'description' to update.",
        )

    ticket = ticket_crud.get_ticket_by_ticket_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )

    ticket_crud.update_ticket_fields(
        db,
        ticket,
        status=payload.status.value if payload.status is not None else None,
        subject=payload.subject,
        description=payload.description,
    )

    return TicketDetailOut(
        **TicketOut.model_validate(ticket).model_dump(),
        notes=[NoteOut.model_validate(n) for n in ticket.notes],
    )
