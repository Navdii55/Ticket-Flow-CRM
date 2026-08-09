"""
crud/ticket_crud.py
--------------------
Pure database-access layer. Every function here takes a SQLAlchemy
`Session` (injected by the caller — never created here) and performs
exactly one kind of query or write operation.

This layer has NO business rules in it (no ticket_id generation, no
default status logic, no validation) — that belongs in
services/ticket_service.py. crud/ only knows how to talk to the
database; services/ knows what those operations mean for the business.
"""

from typing import Optional, Tuple, List

from sqlalchemy import or_, asc, desc
from sqlalchemy.orm import Session

from app.models import Ticket
from app.utils import build_pagination


def create_ticket(db: Session, ticket: Ticket) -> Ticket:
    """
    Persists a new Ticket ORM instance.
    The caller (service layer) is responsible for constructing the
    Ticket object with ticket_id, status, etc. already set.
    """
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket_by_ticket_id(db: Session, ticket_id: str) -> Optional[Ticket]:
    """Fetch a single ticket by its public ticket_id (e.g. 'TKT-001')."""
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def get_last_ticket(db: Session) -> Optional[Ticket]:
    """
    Returns the most recently created ticket (by internal PK), used by
    the service layer to figure out the next sequential ticket number.
    """
    return db.query(Ticket).order_by(desc(Ticket.id)).first()


def list_tickets(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[Ticket], int]:
    """
    Returns a (tickets, total_count) tuple for a filtered, searched,
    sorted, and paginated ticket list.

    - search: case-insensitive match against customer_name, subject,
      or ticket_id.
    - status: exact match filter.
    - sort_by: one of a whitelisted set of columns (validated in the
      service layer before reaching here).
    - sort_order: 'asc' or 'desc'.
    """
    query = db.query(Ticket)

    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.customer_name.ilike(like_pattern),
                Ticket.subject.ilike(like_pattern),
                Ticket.ticket_id.ilike(like_pattern),
            )
        )

    if status:
        query = query.filter(Ticket.status == status)

    # Total count BEFORE pagination is applied, so the client can
    # build correct pagination controls.
    total = query.count()

    sort_column = getattr(Ticket, sort_by)
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(sort_column))

    limit, offset = build_pagination(page, page_size)
    tickets = query.offset(offset).limit(limit).all()

    return tickets, total


def update_ticket_fields(db: Session, ticket: Ticket, **fields) -> Ticket:
    """
    Applies one or more attribute updates to a ticket in a single
    commit (e.g. status, subject, description). Only keys with a
    non-None value are applied, so callers can pass a sparse dict of
    whatever the client actually supplied.
    updated_at refreshes automatically via the model's onupdate default
    since this modifies the ticket row itself.
    """
    for key, value in fields.items():
        if value is not None:
            setattr(ticket, key, value)
    db.commit()
    db.refresh(ticket)
    return ticket
