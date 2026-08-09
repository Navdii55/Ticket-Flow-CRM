import axios, { AxiosError, type AxiosInstance } from "axios";

import { mock } from "./mockTickets";
import type {
  ApiError,
  BackendTicketStatus,
  CreateTicketPayload,
  Note,
  NoteCreateIn,
  NoteOut,
  Ticket,
  TicketCreateIn,
  TicketListOut,
  TicketListResponse,
  TicketOut,
  TicketQuery,
  TicketStatus,
  TicketUpdateIn,
  UpdateTicketPayload,
} from "@/types";

/**
 * Backend base URL — never hardcode a production URL.
 * Configure it in `.env`:  VITE_API_URL=http://127.0.0.1:8000
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Set VITE_USE_MOCK=false to hit the real FastAPI backend. The mock dataset is
 * only a temporary development fallback — no UI code depends on it.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL.replace(/\/$/, "")}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const detail = error.response?.data?.detail;
    const message =
      (typeof detail === "string" ? detail : detail?.[0]?.msg) ??
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

/* -------------------------------------------------------------------------- */
/*  Mappers — FastAPI (snake_case) <-> UI model (camelCase)                    */
/* -------------------------------------------------------------------------- */

const STATUS_FROM_BACKEND: Record<string, TicketStatus> = {
  Open: "open",
  "In Progress": "in_progress",
  Closed: "closed",
  open: "open",
  in_progress: "in_progress",
  closed: "closed",
};

const STATUS_TO_BACKEND: Record<TicketStatus, BackendTicketStatus> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export function toUiStatus(status: string | undefined): TicketStatus {
  return STATUS_FROM_BACKEND[(status ?? "").trim()] ?? "open";
}

export function toBackendStatus(status: TicketStatus): BackendTicketStatus {
  return STATUS_TO_BACKEND[status];
}

/** NoteOut -> the note shape the timeline UI already renders. */
export function mapNote(note: NoteOut, index = 0): Note {
  return {
    id: String(note.note_id ?? note.id ?? `note-${index}`),
    author: note.author?.trim() || "Support Agent",
    body: note.note_text ?? "",
    createdAt: note.created_at ?? new Date().toISOString(),
  };
}

/** TicketOut -> the ticket shape every component already consumes. */
export function mapTicket(ticket: TicketOut, notes?: NoteOut[]): Ticket {
  const rawNotes = notes ?? ticket.notes ?? [];
  return {
    id: String(ticket.ticket_id),
    customerName: ticket.customer_name,
    email: ticket.customer_email,
    subject: ticket.subject,
    description: ticket.description,
    status: toUiStatus(ticket.status),
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at ?? ticket.created_at,
    notes: rawNotes.map(mapNote),
  };
}

function mapCreatePayload(payload: CreateTicketPayload): TicketCreateIn {
  return {
    customer_name: payload.customerName,
    customer_email: payload.email,
    subject: payload.subject,
    description: payload.description,
  };
}

function mapUpdatePayload(payload: UpdateTicketPayload): TicketUpdateIn {
  const body: TicketUpdateIn = {};
  if (payload.status) body.status = toBackendStatus(payload.status);
  if (payload.subject !== undefined) body.subject = payload.subject;
  if (payload.description !== undefined) body.description = payload.description;
  return body;
}

/** Applies search/status/pagination client-side when the backend returns a plain list. */
function paginateLocally(tickets: Ticket[], query: TicketQuery): TicketListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 8;
  const search = query.search?.trim().toLowerCase();

  let rows = tickets;
  if (query.status && query.status !== "all") {
    rows = rows.filter((t) => t.status === query.status);
  }
  if (search) {
    rows = rows.filter((t) =>
      [t.id, t.customerName, t.email, t.subject]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }

  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total: rows.length, page, pageSize };
}

/* -------------------------------------------------------------------------- */
/*  Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

/** GET /api/tickets */
export async function getTickets(query: TicketQuery = {}): Promise<TicketListResponse> {
  if (USE_MOCK) return mock.list(query);

  const params: Record<string, string | number> = {};
  if (query.search) params.search = query.search;
  if (query.status && query.status !== "all") params.status = toBackendStatus(query.status);
  if (query.page) params.page = query.page;
  if (query.pageSize) params.page_size = query.pageSize;

  const { data } = await api.get<TicketOut[] | TicketListOut>("/tickets", { params });

  // The backend may return a bare array or a paginated envelope — support both.
  if (Array.isArray(data)) {
    return paginateLocally(data.map((t) => mapTicket(t)), query);
  }

  const rows = (data.tickets ?? data.items ?? data.data ?? data.results ?? []).map((t) => mapTicket(t));
  return {
    data: rows,
    total: data.total ?? rows.length,
    page: data.page ?? query.page ?? 1,
    pageSize: data.page_size ?? data.pageSize ?? query.pageSize ?? rows.length,
  };
}

/** GET /api/tickets/{ticket_id} (+ GET /api/tickets/{ticket_id}/notes) */
export async function getTicket(id: string): Promise<Ticket> {
  if (USE_MOCK) return mock.get(id);

  const [{ data: ticket }, notes] = await Promise.all([
    api.get<TicketOut>(`/tickets/${id}`),
    getRawNotes(id),
  ]);
  return mapTicket(ticket, notes);
}

/** POST /api/tickets */
export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  if (USE_MOCK) return mock.create(payload);
  const { data } = await api.post<TicketOut>("/tickets", mapCreatePayload(payload));
  return mapTicket(data);
}

/** PUT /api/tickets/{ticket_id} */
export async function updateTicket(
  id: string,
  payload: UpdateTicketPayload,
): Promise<Ticket> {
  if (USE_MOCK) return mock.update(id, payload);
  const { data } = await api.put<TicketOut>(`/tickets/${id}`, mapUpdatePayload(payload));
  return mapTicket(data, await getRawNotes(id));
}

async function getRawNotes(id: string): Promise<NoteOut[]> {
  try {
    const { data } = await api.get<NoteOut[]>(`/tickets/${id}/notes`);
    return Array.isArray(data) ? data : [];
  } catch {
    // Notes are non-critical for rendering the ticket detail page.
    return [];
  }
}

/** GET /api/tickets/{ticket_id}/notes */
export async function getTicketNotes(id: string): Promise<Note[]> {
  if (USE_MOCK) return (await mock.get(id)).notes;
  return (await getRawNotes(id)).map(mapNote);
}

/**
 * POST /api/tickets/{ticket_id}/notes
 * FastAPI `NoteCreate` only accepts `note_text` — the author is not sent.
 */
export async function addTicketNote(
  id: string,
  body: string,
  author = "You",
): Promise<Ticket> {
  if (USE_MOCK) return mock.addNote(id, body, author);
  const payload: NoteCreateIn = { note_text: body };
  await api.post<NoteOut>(`/tickets/${id}/notes`, payload);
  return getTicket(id);
}
