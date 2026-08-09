"""
services/note_service.py
--------------------------
Business logic layer for notes. Its main responsibility beyond calling
crud/note_crud.py is enforcing that a note can never be read or
created against a ticket that doesn't exist — that check belongs here,
not in note_crud.py (which has no concept of "valid" vs "invalid"
tickets) and not in note_routes.py (which should stay a thin adapter).

This module depends on ticket_crud (not note_crud) to resolve the
public ticket_id string into a Ticket ORM instance, since ticket
lookups are inherently a ticket-CRUD concern.
"""

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import ticket_crud, note_crud
from app.schemas import NoteCreate, NoteOut


def _get_ticket_or_404(db: Session, ticket_id: str):
    """
    Shared lookup used by both note operations below. Raises 404 if
    the ticket_id doesn't correspond to any existing ticket, so notes
    can never be listed or created against a non-existent ticket.
    """
    ticket = ticket_crud.get_ticket_by_ticket_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )
    return ticket


def get_notes(db: Session, ticket_id: str) -> List[NoteOut]:
    """
    Returns all notes for a ticket, oldest first. Empty list if the
    ticket exists but has no notes yet; 404 if the ticket itself
    doesn't exist.
    """
    ticket = _get_ticket_or_404(db, ticket_id)
    notes = note_crud.get_notes_for_ticket(db, ticket.id)
    return [NoteOut.model_validate(n) for n in notes]


def create_note(db: Session, ticket_id: str, payload: NoteCreate) -> NoteOut:
    """
    Validates the ticket exists, then creates a note attached to it.
    Returns the created note (with server-generated id and created_at)
    for the route to return with a 201 status.
    """
    ticket = _get_ticket_or_404(db, ticket_id)
    note = note_crud.create_note(db, ticket.id, payload.note_text)
    return NoteOut.model_validate(note)
