export type TicketStatus = "open" | "in_progress" | "closed";

export interface TicketNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  notes: TicketNote[];
}

export interface CreateTicketPayload {
  customerName: string;
  email: string;
  subject: string;
  description: string;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  subject?: string;
  description?: string;
}

export interface TicketQuery {
  search?: string;
  status?: TicketStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

/** Aliases matching the FastAPI schema names. */
export type Note = TicketNote;
export type TicketCreate = CreateTicketPayload;
export type TicketUpdate = UpdateTicketPayload;

/** Error payload shape returned by the backend. */
export interface ApiError {
  detail?: string | { msg?: string }[];
  message?: string;
}

/* -------------------------------------------------------------------------- */
/*  FastAPI wire types (snake_case) — used ONLY inside src/services/api.ts     */
/* -------------------------------------------------------------------------- */

/** Status values exactly as the FastAPI backend stores/returns them. */
export type BackendTicketStatus = "Open" | "In Progress" | "Closed";

/** FastAPI `TicketOut` schema. */
export interface TicketOut {
  ticket_id: string | number;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: BackendTicketStatus | string;
  created_at: string;
  updated_at: string;
  /** Some backends embed notes on the detail response. */
  notes?: NoteOut[];
}

/** FastAPI `TicketCreate` schema. */
export interface TicketCreateIn {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}

/** FastAPI `TicketUpdate` schema (all fields optional / partial). */
export interface TicketUpdateIn {
  status?: BackendTicketStatus;
  subject?: string;
  description?: string;
}

/** FastAPI `NoteOut` schema. */
export interface NoteOut {
  note_id?: string | number;
  id?: string | number;
  ticket_id?: string | number;
  note_text: string;
  created_at?: string;
  author?: string | null;
}

/** FastAPI `NoteCreate` schema. */
export interface NoteCreateIn {
  note_text: string;
}

/** Paginated list envelope, when the backend returns one. */
export interface TicketListOut {
  tickets?: TicketOut[];
  items?: TicketOut[];
  data?: TicketOut[];
  results?: TicketOut[];
  total?: number;
  page?: number;
  page_size?: number;
  pageSize?: number;
}
