import type {
  CreateTicketPayload,
  Ticket,
  TicketListResponse,
  TicketQuery,
  TicketStatus,
  UpdateTicketPayload,
} from "@/types";

const now = Date.now();
const iso = (daysAgo: number, hours = 0) =>
  new Date(now - daysAgo * 86400000 - hours * 3600000).toISOString();

const seed: Ticket[] = [
  {
    id: "TCK-1042",
    customerName: "Amelia Hart",
    email: "amelia.hart@northwind.co",
    subject: "Unable to export monthly invoice report",
    description:
      "Clicking Export on the billing page spins forever and eventually returns a 504. This started after the latest release.",
    status: "open",
    createdAt: iso(0, 3),
    updatedAt: iso(0, 1),
    notes: [
      {
        id: "n1",
        author: "Support Bot",
        body: "Ticket received and routed to Billing queue.",
        createdAt: iso(0, 3),
      },
    ],
  },
  {
    id: "TCK-1041",
    customerName: "Marcus Feld",
    email: "m.feld@bluepeak.io",
    subject: "SSO login redirect loop",
    description:
      "Users on the Okta tenant get bounced between the IdP and the app login screen indefinitely.",
    status: "in_progress",
    createdAt: iso(1, 2),
    updatedAt: iso(0, 5),
    notes: [
      {
        id: "n1",
        author: "Priya N.",
        body: "Reproduced on staging. Looks like the callback URL is missing the tenant slug.",
        createdAt: iso(1),
      },
      {
        id: "n2",
        author: "Priya N.",
        body: "Patch queued for the Thursday deploy window.",
        createdAt: iso(0, 5),
      },
    ],
  },
  {
    id: "TCK-1040",
    customerName: "Sofia Almeida",
    email: "sofia@lumenlabs.dev",
    subject: "Request: bulk assign tickets to an agent",
    description:
      "We handle ~300 tickets a day and reassigning one by one is painful. Any chance of a multi-select action?",
    status: "open",
    createdAt: iso(2, 6),
    updatedAt: iso(2, 6),
    notes: [],
  },
  {
    id: "TCK-1039",
    customerName: "Dev Raghunathan",
    email: "dev.r@quantabyte.com",
    subject: "Webhook signatures failing validation",
    description:
      "Our verifier rejects roughly 5% of payloads. Suspect trailing whitespace in the raw body.",
    status: "in_progress",
    createdAt: iso(3, 1),
    updatedAt: iso(1, 4),
    notes: [
      {
        id: "n1",
        author: "Tom W.",
        body: "Asked customer for three sample payload IDs.",
        createdAt: iso(2),
      },
    ],
  },
  {
    id: "TCK-1038",
    customerName: "Hannah Oyelaran",
    email: "hannah@brightfold.org",
    subject: "Billing address not saving on the EU plan",
    description: "The country dropdown resets to United States after saving.",
    status: "closed",
    createdAt: iso(5, 2),
    updatedAt: iso(3),
    notes: [
      {
        id: "n1",
        author: "Tom W.",
        body: "Fixed in 4.12.1 — country code was not persisted for non-US regions.",
        createdAt: iso(3),
      },
    ],
  },
  {
    id: "TCK-1037",
    customerName: "Leon Vasquez",
    email: "leon.v@harborline.net",
    subject: "Dark mode contrast on the ticket table",
    description: "Closed-status rows are almost unreadable on the dark theme.",
    status: "closed",
    createdAt: iso(6),
    updatedAt: iso(4),
    notes: [],
  },
  {
    id: "TCK-1036",
    customerName: "Yuki Tanaka",
    email: "y.tanaka@sakura-tech.jp",
    subject: "API rate limit hit during nightly sync",
    description:
      "We get 429s between 02:00 and 02:20 UTC. Can the burst limit be raised for our workspace?",
    status: "open",
    createdAt: iso(7, 3),
    updatedAt: iso(7, 3),
    notes: [],
  },
  {
    id: "TCK-1035",
    customerName: "Grace Bennett",
    email: "grace@meadowlark.studio",
    subject: "Attachment upload fails over 10 MB",
    description: "Drag-and-drop shows a generic error with no size guidance.",
    status: "in_progress",
    createdAt: iso(8),
    updatedAt: iso(5),
    notes: [],
  },
  {
    id: "TCK-1034",
    customerName: "Owen Pritchard",
    email: "owen.p@stonegate.co.uk",
    subject: "Duplicate notification emails",
    description: "Every status change sends two identical emails to the requester.",
    status: "closed",
    createdAt: iso(10),
    updatedAt: iso(9),
    notes: [],
  },
  {
    id: "TCK-1033",
    customerName: "Nadia Rahman",
    email: "nadia@cobaltworks.io",
    subject: "Cannot invite teammates with a plus-alias email",
    description: "Addresses like nadia+support@ are rejected as invalid.",
    status: "open",
    createdAt: iso(11),
    updatedAt: iso(11),
    notes: [],
  },
  {
    id: "TCK-1032",
    customerName: "Felix Braun",
    email: "f.braun@altmark.de",
    subject: "Timezone shown in UTC instead of local",
    description: "Ticket timestamps ignore the workspace timezone setting.",
    status: "closed",
    createdAt: iso(13),
    updatedAt: iso(12),
    notes: [],
  },
  {
    id: "TCK-1031",
    customerName: "Iris Kovac",
    email: "iris@northloop.app",
    subject: "Search does not match customer email",
    description: "Searching by email returns nothing unless I paste the exact subject line.",
    status: "in_progress",
    createdAt: iso(14),
    updatedAt: iso(13),
    notes: [],
  },
];

let store: Ticket[] = seed.map((t) => ({ ...t, notes: [...t.notes] }));
let counter = 1043;

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export const mock = {
  async list(query: TicketQuery = {}): Promise<TicketListResponse> {
    await delay();
    const { search = "", status = "all", page = 1, pageSize = 8 } = query;
    const term = search.trim().toLowerCase();
    const filtered = store.filter((t) => {
      const matchesStatus = status === "all" || t.status === status;
      const matchesTerm =
        !term ||
        [t.id, t.customerName, t.email, t.subject].some((f) =>
          f.toLowerCase().includes(term),
        );
      return matchesStatus && matchesTerm;
    });
    const start = (page - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async get(id: string): Promise<Ticket> {
    await delay(250);
    const found = store.find((t) => t.id.toLowerCase() === id.toLowerCase());
    if (!found) throw new Error(`Ticket ${id} was not found.`);
    return { ...found, notes: [...found.notes] };
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    await delay(500);
    const stamp = new Date().toISOString();
    const ticket: Ticket = {
      ...payload,
      id: `TCK-${counter++}`,
      status: "open" as TicketStatus,
      createdAt: stamp,
      updatedAt: stamp,
      notes: [],
    };
    store = [ticket, ...store];
    return ticket;
  },

  async update(id: string, payload: UpdateTicketPayload): Promise<Ticket> {
    await delay(400);
    const idx = store.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    const current = store[idx];
    if (!current) throw new Error(`Ticket ${id} was not found.`);
    const next: Ticket = { ...current, ...payload, updatedAt: new Date().toISOString() };
    store[idx] = next;
    return next;
  },

  async addNote(id: string, body: string, author: string): Promise<Ticket> {
    await delay(350);
    const idx = store.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    const current = store[idx];
    if (!current) throw new Error(`Ticket ${id} was not found.`);
    const next: Ticket = {
      ...current,
      updatedAt: new Date().toISOString(),
      notes: [
        ...current.notes,
        { id: crypto.randomUUID(), author, body, createdAt: new Date().toISOString() },
      ],
    };
    store[idx] = next;
    return next;
  },
};

