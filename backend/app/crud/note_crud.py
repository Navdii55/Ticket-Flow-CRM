"""
crud/note_crud.py
------------------
Pure database-access layer for notes, kept completely separate from
ticket_crud.py. Each function performs exactly one query or write —
no business rules (e.g. "does the ticket exist?") live here, that
belongs in services/note_service.py.

Notes are always accessed in the context of a ticket's internal id
(Ticket.id), never the public ticket_id string — resolving that
string is the service layer's job.
"""

from typing import List

from sqlalchemy import asc
from sqlalchemy.orm import Session

from app.models import Note


def get_notes_for_ticket(db: Session, ticket_internal_id: int) -> List[Note]:
    """
    Returns all notes for a given ticket (by internal PK), sorted by
    created_at ascending (oldest first). Returns an empty list
    naturally if none exist — no special-casing needed since a
    plain SELECT with no matching rows already yields [].
    """
    return (
        db.query(Note)
        .filter(Note.ticket_db_id == ticket_internal_id)
        .order_by(asc(Note.created_at))
        .all()
    )


def create_note(db: Session, ticket_internal_id: int, note_text: str) -> Note:
    """
    Inserts a new note linked to the given ticket's internal id.
    created_at is populated automatically via the model's default.
    """
    note = Note(ticket_db_id=ticket_internal_id, note_text=note_text)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
