"""
routes/ticket_routes.py
------------------------
HTTP layer for ticket endpoints. Each route function does exactly
three things: receive the request (validated by FastAPI/Pydantic),
call the corresponding service function, return its result.

No business logic, no direct database access, no exception handling
beyond what FastAPI/the service layer already provides — if this file
starts growing if/else branches, that logic belongs in
services/ticket_service.py instead.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    TicketOut,
    TicketDetailOut,
    TicketListResponse,
)
from app.services import ticket_service

# prefix + tags keep every route here under /api/tickets and grouped
# together in the auto-generated OpenAPI docs.
router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post("", response_model=TicketOut, status_code=201)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    """
    Create a new support ticket.
    ticket_id, status ('Open'), and timestamps are generated automatically.
    """
    return ticket_service.create_ticket(db, payload)


@router.get("", response_model=TicketListResponse)
def list_tickets(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(
        default=None, description="Search by customer name, subject, or ticket_id."
    ),
    status: Optional[str] = Query(default=None, description="Filter by exact status."),
    sort_by: str = Query(default="created_at", description="Field to sort by."),
    sort_order: str = Query(default="desc", description="'asc' or 'desc'."),
    page: int = Query(default=1, ge=1, description="Page number, starting at 1."),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page."),
):
    """
    List tickets with optional search, status filtering, sorting, and
    pagination.
    """
    return ticket_service.list_tickets(
        db,
        search=search,
        status_filter=status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )


@router.get("/{ticket_id}", response_model=TicketDetailOut)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details for a single ticket, including all notes.
    Returns 404 if the ticket_id does not exist.
    """
    return ticket_service.get_ticket_detail(db, ticket_id)


@router.put("/{ticket_id}", response_model=TicketDetailOut)
def update_ticket(ticket_id: str, payload: TicketUpdate, db: Session = Depends(get_db)):
    """
    Update ticket-level information: status, subject, and/or description.
    At least one field must be provided. Notes are managed separately
    via the dedicated Notes API (see routes/note_routes.py).
    """
    return ticket_service.update_ticket(db, ticket_id, payload)
