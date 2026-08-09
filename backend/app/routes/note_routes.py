"""
routes/note_routes.py
-----------------------
HTTP layer for the dedicated Notes API. Same pattern as
ticket_routes.py: receive request, call the service, return its
result. No business logic, no direct crud/model access.

Mounted under /api/tickets/{ticket_id}/notes — nested under tickets
since a note is always scoped to a parent ticket.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import NoteCreate, NoteOut
from app.services import note_service

router = APIRouter(prefix="/api/tickets/{ticket_id}/notes", tags=["Notes"])


@router.get("", response_model=list[NoteOut])
def list_notes(ticket_id: str, db: Session = Depends(get_db)):
    """
    Return all notes for the specified ticket, sorted by created_at
    ascending. Returns an empty list if the ticket has no notes.
    Returns 404 if the ticket itself does not exist.
    """
    return note_service.get_notes(db, ticket_id)


@router.post("", response_model=NoteOut, status_code=201)
def create_note(ticket_id: str, payload: NoteCreate, db: Session = Depends(get_db)):
    """
    Add a new note to the specified ticket. Validates the ticket
    exists (404 if not), auto-populates created_at, and returns the
    created note with HTTP 201.
    """
    return note_service.create_note(db, ticket_id, payload)
