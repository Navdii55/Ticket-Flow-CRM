"""
models.py
---------
SQLAlchemy ORM models. These classes are the Python-side representation
of the `tickets` and `notes` tables — SQLAlchemy uses them both to
generate the schema (via Base.metadata.create_all in main.py) and to
map query results back into Python objects.

Only table structure and relationships live here. No business logic,
no validation beyond what the database itself enforces (nullability,
uniqueness) — validation of incoming data belongs in schemas.py.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


def _utcnow() -> datetime:
    """Timezone-aware UTC timestamp generator, used as a default for
    created_at/updated_at columns. Wrapped in a function (rather than
    passing datetime.utcnow directly) so it's evaluated fresh for
    every insert/update, not once at import time."""
    return datetime.now(timezone.utc)


class Ticket(Base):
    """
    Represents a single customer support ticket.

    - `ticket_id` is the human-facing identifier (e.g. "TKT-001"),
      generated in the service layer — distinct from `id`, the
      internal auto-increment primary key used for joins/lookups.
    - `status` defaults to "Open" per the business requirements.
    - `notes` is a one-to-many relationship to the Note model:
      one ticket can have many notes attached to it over its lifecycle.
    """

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    # Human-readable, sequentially generated ticket identifier.
    # Unique + indexed since it's the primary lookup key used in URLs
    # (GET /api/tickets/{ticket_id}).
    ticket_id = Column(String, unique=True, index=True, nullable=False)

    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False, index=True)

    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    # Simple string-based status field. Kept as a validated String
    # (constrained in schemas.py) rather than a DB-level Enum, so new
    # statuses can be added without a migration.
    status = Column(String, nullable=False, default="Open")

    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # One ticket -> many notes. cascade="all, delete-orphan" ensures
    # that if a ticket is ever deleted, its notes are cleaned up too
    # rather than left as orphaned rows.
    notes = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Note.created_at",
    )


class Note(Base):
    """
    Represents an internal note/comment attached to a ticket.
    Notes are managed exclusively through the dedicated Notes API
    (routes/note_routes.py): created via POST /api/tickets/{ticket_id}/notes
    and listed via GET /api/tickets/{ticket_id}/notes. They are
    append-only in this design — never edited or deleted individually.
    """

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to tickets.id (the internal PK, not the public
    # ticket_id string). Named ticket_db_id — deliberately distinct
    # from Ticket.ticket_id (the "TKT-0001"-style public string) so
    # the two are never confused: this column is always an integer
    # pointing at a row, that one is always a display string.
    # Indexed since every note lookup filters on this column.
    ticket_db_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)

    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Back-reference so a Note instance can access note.ticket directly.
    ticket = relationship("Ticket", back_populates="notes")
