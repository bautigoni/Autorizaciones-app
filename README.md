# Salida Segura

A full-stack school operations app for early student pick-ups and non-standard departures. Families create withdrawal authorizations from mobile, school staff review them, and gate/security validates the pickup at the door — all with a complete audit trail.

> Warm, modern UI · React + Vite + TypeScript · Express + SQLite

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Seed the SQLite database (creates data/salida-segura.db)
npm run db:seed

# 3. Start both API + Vite dev server
npm run dev
```

The web app will be available at **http://localhost:5173**, the API at **http://localhost:5174** (proxied through Vite, so the client just calls `/api/*`).

### Demo accounts (password: `demo`)

| Role        | Email                       |
| ----------- | --------------------------- |
| Familia     | `maria@familia.edu`         |
| Familia     | `pablo@familia.edu`         |
| Preceptor   | `preceptor@cole.edu`        |
| Secretaría  | `secretaria@cole.edu`       |
| Portería    | `porteria@cole.edu`         |
| Dirección   | `direccion@cole.edu`        |

The login screen has a one-click button for each demo account.

---

## Scripts

| Command            | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Run API (tsx watch) + Vite dev server in parallel    |
| `npm run dev:client` | Vite only                                          |
| `npm run dev:server` | Express API only                                   |
| `npm run db:seed`  | Initialize / seed the SQLite database                |
| `npm run db:reset` | Delete and re-seed the database                      |
| `npm run build`    | Build the client to `dist/`                          |
| `npm run preview`  | Serve the built client                               |

## Database

- **Engine:** SQLite (via `better-sqlite3`), single file at `data/salida-segura.db`.
- **Schema:** see [`server/db/schema.sql`](server/db/schema.sql) — users, students, guardians, authorized_adults, authorizations, auth_history, attachments.
- **Source of truth:** all reads/writes go through the API. The frontend never hardcodes app data.
- **Seed:** [`server/db/seed.ts`](server/db/seed.ts) creates a realistic set of users, students, guardians, adults, and ~12 authorizations across the past and upcoming days.

## Project structure

```
.
├── server/                 # Express + SQLite API
│   ├── index.ts            # HTTP server + REST routes
│   ├── db/
│   │   ├── index.ts        # better-sqlite3 connection
│   │   ├── schema.sql      # DDL
│   │   └── seed.ts         # Initial data
│   └── services/
│       └── authorizations.ts  # Domain logic (CRUD, status, history)
├── shared/
│   └── types.ts            # Types shared between client and server
├── src/                    # React frontend
│   ├── main.tsx
│   ├── App.tsx             # Router + role-based redirects
│   ├── styles/index.css    # Tailwind layers
│   ├── layouts/            # FamilyLayout, InternalLayout, GateLayout
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── family/         # mobile-first family experience
│   │   ├── internal/       # staff dashboard + table + detail
│   │   └── gate/           # gate/security search & withdrawal
│   ├── components/         # Reusable UI primitives
│   ├── services/           # api client + auth context
│   └── utils/              # date helpers, etc.
├── public/                 # Static assets (logo)
└── data/                   # SQLite database file (gitignored)
```

## Roles

The app provides three role-based experiences:

1. **Family** (`/familia`): create authorizations, list & cancel them, dashboard.
2. **School staff** (`/cole`) — preceptor, secretaría, dirección: dashboard with today's metrics, full table with filters, detail view with approve/reject/observe + audit trail.
3. **Gate/security** (`/porteria`): search authorizations for today, see clear status banners, register the withdrawal.

Role selection is automatic after login. Routes are guarded by role.

## Environment variables

None required for local dev. The API defaults to port `5174`; override with `PORT`. The client uses Vite's proxy so no `VITE_API_URL` is needed.

---

## How it looks

- **Color system:** warm orange/peach/cream/beige/coral with pastel sage green for success states. Subtle gradients on hero areas, cards, action buttons, and status highlights.
- **Components:** every interactive element is custom-styled (selects, checkboxes, radios, switches, modals, drawers, tables, badges, etc). No browser-default UI is visible.
- **Responsive:** the family experience is mobile-first with a sticky bottom nav + FAB; internal/gate are desktop-first but degrade cleanly to mobile.

See [`CLAUDE.md`](CLAUDE.md) for architecture notes and conventions used by future contributors (or AI agents).
