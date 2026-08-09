"""
schemas.py
----------
Pydantic v2 models that define the API's request and response contracts.

These are intentionally kept separate from the SQLAlchemy models in
models.py: models.py describes how data is stored, schemas.py describes
how data is validated coming in and shaped going out. Routes/services
only ever work with these schemas at the HTTP boundary — the ORM
objects never leak directly into a response.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class TicketStatus(str, Enum):
    """
    Restricts ticket status to a fixed set of valid values. Using an
    Enum (rather than a free-text string) means invalid statuses are
    rejected automatically by Pydantic with a 422, before any service
    or CRUD code even runs.

    Kept in sync with utils.VALID_STATUSES — both define the same
    three-status set as the single source of truth for what a ticket's
    status is allowed to be.
    """
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


# ---------------------------------------------------------------------
# Note schemas
# ---------------------------------------------------------------------

class NoteCreate(BaseModel):
    """Payload for adding a note to a ticket."""
    note_text: str = Field(..., min_length=1, max_length=2000)


class NoteOut(BaseModel):
    """Shape of a note as returned by the API."""
    id: int
    note_text: str
    created_at: datetime

    # Allows Pydantic to build this model directly from a SQLAlchemy
    # ORM instance (model_config replaces the old class Config: orm_mode).
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------
# Ticket schemas
# ---------------------------------------------------------------------

class TicketCreate(BaseModel):
    """
    Payload for POST /api/tickets.
    ticket_id, status, and timestamps are never accepted from the
    client — they are generated server-side in the service layer.
    """
    customer_name: str = Field(..., min_length=1, max_length=150)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)


class TicketUpdate(BaseModel):
    """
    Payload for PUT /api/tickets/{ticket_id}.
    Focused solely on ticket-level fields — status, subject, and
    description. Notes are managed exclusively through the dedicated
    Notes API (routes/note_routes.py), not here.
    All fields optional so a client can update just one at a time.
    """
    status: Optional[TicketStatus] = None
    subject: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1, max_length=5000)


class TicketOut(BaseModel):
    """Summary shape of a ticket — used in list responses (GET /api/tickets)."""
    id: int
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetailOut(TicketOut):
    """
    Full ticket shape including its notes — used for
    GET /api/tickets/{ticket_id}, where the spec requires the
    complete ticket detail including notes.
    """
    notes: List[NoteOut] = []


class TicketListResponse(BaseModel):
    """
    Wraps the ticket list with pagination metadata, so the client
    knows the total count independent of the current page size —
    needed for search/filter/sort UIs to build pagination controls.
    """
    total: int
    page: int
    page_size: int
    tickets: List[TicketOut]
