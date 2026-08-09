# TicketFlow CRM — Frontend

Standard **React + TypeScript + Vite** frontend for the TicketFlow Customer Support CRM.
Styled with Tailwind CSS v4, data fetching with TanStack Query + Axios, routing with React Router.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build    # outputs to dist/
npm run preview
```

## Environment

| Variable        | Description                          | Default                 |
| --------------- | ------------------------------------ | ----------------------- |
| `VITE_API_URL`  | FastAPI backend base URL             | `http://127.0.0.1:8000` |
| `VITE_USE_MOCK` | `false` to disable the sample dataset | `true`                  |

The production backend URL is never hardcoded — set `VITE_API_URL` in `.env`.

## Backend endpoints consumed

```
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/{ticket_id}
PUT    /api/tickets/{ticket_id}
GET    /api/tickets/{ticket_id}/notes
POST   /api/tickets/{ticket_id}/notes
```

All HTTP access lives in `src/services/api.ts`. To connect the real FastAPI backend,
set `VITE_API_URL` and `VITE_USE_MOCK=false` — no UI code changes required.

## Structure

```
src/
├── main.tsx          app entry
├── App.tsx           providers, layout shell, routes
├── index.css         Tailwind theme + design tokens
├── components/       reusable UI (Navbar, Sidebar, TicketTable, …)
├── pages/            Dashboard, CreateTicket, TicketDetails, NotFound
├── services/         api.ts (Axios) + mockTickets.ts (temporary fallback)
├── hooks/            usePageMeta, use-mobile
├── lib/              formatting + class utilities
└── types/            Ticket, Note, payload and list-response types
```

## Pages

- **Dashboard** `/` — statistics cards, search, status filter, ticket table, pagination, empty/loading states
- **Create Ticket** `/tickets/new` — validated form with success/error toasts
- **Ticket Details** `/tickets/:ticketId` — ticket + customer info, status update, notes & activity timeline
- **404** — any unmatched route
