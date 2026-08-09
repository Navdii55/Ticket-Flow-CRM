import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiMail,
  FiUser,
  FiClock,
  FiSave,
  FiMessageSquare,
  FiAlertCircle,
} from "react-icons/fi";

import { StatusBadge } from "@/components/StatusBadge";
import { TicketDetailsSkeleton } from "@/components/Loader";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/components/Toast";
import { addTicketNote, getTicket, updateTicket } from "@/services/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { STATUS_LABELS, type TicketStatus } from "@/types";
import { formatDateTime, initials } from "@/lib/format";



const statuses: TicketStatus[] = ["open", "in_progress", "closed"];

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiUser;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function TicketDetails() {
  const { ticketId = "" } = useParams<{ ticketId: string }>();
  usePageMeta(
    "Ticket Details — HelpDesk CRM",
    "Review customer information, issue details and the full note timeline.",
  );
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TicketStatus>("open");
  const [note, setNote] = useState("");

  const ticketQuery = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => getTicket(ticketId),
    retry: false,
  });

  const ticket = ticketQuery.data;

  useEffect(() => {
    if (ticket) setStatus(ticket.status);
  }, [ticket]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  };

  const updateMutation = useMutation({
    mutationFn: () => updateTicket(ticketId, { status }),
    onSuccess: () => {
      invalidate();
      toast.success("Ticket updated", `Status set to ${STATUS_LABELS[status]}.`);
    },
    onError: (error: Error) => toast.error("Update failed", error.message),
  });

  const noteMutation = useMutation({
    mutationFn: () => addTicketNote(ticketId, note.trim()),
    onSuccess: () => {
      setNote("");
      invalidate();
      toast.success("Note added");
    },
    onError: (error: Error) => toast.error("Could not add note", error.message),
  });

  if (ticketQuery.isLoading) return <TicketDetailsSkeleton />;

  if (ticketQuery.isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto size-8 text-destructive" />
        <h1 className="mt-3 text-lg font-semibold">Ticket unavailable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {(ticketQuery.error as Error | null)?.message ?? "Please try again."}
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const dirty = status !== ticket.status;

  const activity: { id: string; title: string; detail?: string; at: string }[] = [
    {
      id: "created",
      title: "Ticket created",
      detail: `Opened by ${ticket.customerName}`,
      at: ticket.createdAt,
    },
    ...ticket.notes.map((n) => ({
      id: `note-${n.id}`,
      title: "Note added",
      detail: `${n.author}: ${n.body}`,
      at: n.createdAt,
    })),
    {
      id: "updated",
      title: `Status: ${STATUS_LABELS[ticket.status]}`,
      detail: "Last update on this ticket",
      at: ticket.updatedAt,
    },
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <FiArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {ticket.id}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {ticket.subject}
          </h1>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Ticket information
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Ticket ID</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold">{ticket.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created date</dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatDateTime(ticket.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last updated</dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatDateTime(ticket.updatedAt)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Subject</dt>
                <dd className="mt-0.5 text-sm font-medium">{ticket.subject}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Issue details
            </h2>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Notes timeline
            </h2>

            {ticket.notes.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No notes yet. Add the first update below.
              </p>
            ) : (
              <ol className="mt-4 space-y-5 border-l border-border pl-5">
                {ticket.notes.map((n) => (
                  <li key={n.id} className="relative">
                    <span className="absolute top-1.5 -left-[26px] size-2.5 rounded-full bg-primary ring-4 ring-card" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{n.author}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-5 border-t border-border pt-5">
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
                Add a note
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share an internal update on this ticket…"
                className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={!note.trim() || noteMutation.isPending}
                  onClick={() => noteMutation.mutate()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  <FiMessageSquare className="size-4" />
                  {noteMutation.isPending ? "Adding…" : "Add note"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Activity timeline
            </h2>
            <ol className="mt-4 space-y-5 border-l border-border pl-5">
              {activity.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute top-1.5 -left-[26px] grid size-2.5 place-items-center rounded-full bg-accent-foreground/60 ring-4 ring-card" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{event.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.at)}
                    </span>
                  </div>
                  {event.detail && (
                    <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Customer information
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {initials(ticket.customerName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{ticket.customerName}</p>
                <p className="truncate text-xs text-muted-foreground">{ticket.email}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <InfoRow icon={FiUser} label="Requester" value={ticket.customerName} />
              <InfoRow icon={FiMail} label="Email" value={ticket.email} />
              <InfoRow
                icon={FiClock}
                label="Created"
                value={formatDateTime(ticket.createdAt)}
              />
              <InfoRow
                icon={FiClock}
                label="Last updated"
                value={formatDateTime(ticket.updatedAt)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Status
            </h2>
            <label htmlFor="status" className="sr-only">
              Ticket status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="mt-3 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!dirty || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <FiSave className="size-4" />
              {updateMutation.isPending ? "Updating…" : "Update ticket"}
            </button>
            {!dirty && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Change the status to enable updating.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
