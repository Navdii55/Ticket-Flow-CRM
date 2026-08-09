import { Link } from "react-router-dom";
import { FiMail, FiChevronRight } from "react-icons/fi";

import { StatusBadge } from "./StatusBadge";
import type { Ticket } from "@/types";
import { formatDate } from "@/lib/format";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-2xl border border-border bg-card p-4 shadow-card transition hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {ticket.id}
        </span>
        <StatusBadge status={ticket.status} />
      </div>
      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold">{ticket.subject}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{ticket.customerName}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <FiMail className="size-3.5 shrink-0" />
        <span className="truncate">{ticket.email}</span>
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Updated {formatDate(ticket.updatedAt)}</span>
        <span className="inline-flex items-center gap-1 font-medium text-primary">
          View <FiChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
