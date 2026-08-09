import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import { StatusBadge } from "./StatusBadge";
import { TicketCard } from "./TicketCard";
import type { Ticket } from "@/types";
import { formatDate, initials } from "@/lib/format";

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <>
      {/* Mobile: cards */}
      <div className="grid gap-3 p-4 md:hidden">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {/* Tablet & desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Ticket
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Customer
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Subject
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Updated
              </th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="group border-b border-border last:border-0 transition hover:bg-muted/40"
              >
                <td className="px-5 py-4 font-mono text-xs font-semibold text-muted-foreground">
                  {ticket.id}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {initials(ticket.customerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{ticket.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ticket.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-xs px-5 py-4">
                  <p className="truncate">{ticket.subject}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                  {formatDate(ticket.updatedAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    aria-label={`Open ticket ${ticket.id}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition group-hover:bg-accent group-hover:text-accent-foreground"
                  >
                    <FiChevronRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
