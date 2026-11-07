# CleaningOS — development guide

Booking manager for a cleaning company (UAE, currency AED). Admins create staff (Cleaners, Drivers) and bookings, assign one or more staff to each booking, and track status, payment and daily reports.

- **client/** React 18 + Vite + React Router (JavaScript)
- **server/** Node 20 + Express 4 + Prisma 5 + MySQL 8 (Laragon)
- **shared/** Zod schemas + constants used by BOTH client and server
- **legacy/** original single-file prototype — reference for look only, do not edit or import

## Run
```
npm install                      # root — installs all workspaces
cp server/.env.example server/.env   # then set JWT_SECRET (≥32 chars)
npm run db:migrate               # creates tables in MySQL `cleaningos`
npm run db:seed                  # first admin (SEED_ADMIN_*) + demo staff
npm run dev                      # API :4000 + web :5173 (Vite proxies /api)
```

## Architecture rules
- **Validation lives in `shared/src/schemas/`.** The same schema validates the form (client) and the request (server). Never write a rule in only one place. Constants/enums live in `shared/src/constants.js`; Prisma enums in `server/prisma/schema.prisma` must match.
- Server flow: `routes/index.js` (path + `validate({ body, query, params })` + `requireAuth`) → `controllers/` (thin: read `req.valid.*`, call service, send JSON) → `services/` (business logic + Prisma). No Prisma calls in controllers or routes.
- Rules that need the DB (staff exists, is active, has the right role, schedule overlap) are **server-only** checks in services and return 422/409.
- Throw `HttpError(status, message, { code, fields, details })` from services; `middleware/errorHandler.js` formats every error.
- Serialise DB rows through `services/serializers.js` — API never returns raw Prisma objects or Decimals.
- Client calls the API only through `client/src/api/index.js` (`request()` adds the JWT and normalises errors to `ApiError`).
- Forms use `hooks/useForm.js` with the shared schema; lists use `hooks/useAsync.js`.

### API error format
```json
{ "error": { "message": "…", "code": "VALIDATION_ERROR", "fields": { "phone": "…" }, "details": [] } }
```
422 validation (`fields` per input) · 409 conflict (`SCHEDULE_CONFLICT` with `details`, `HAS_BOOKINGS`, `HAS_UPCOMING_BOOKINGS`) · 401 not logged in · 404 not found.

### Adding a feature — checklist
1. Constants/schema in `shared/` → 2. Prisma model + `npm run db:migrate` → 3. service → 4. controller + route with `validate()` → 5. `client/src/api/index.js` → 6. page/component using `ui/` primitives → 7. update this file.

## Business rules (do not change without the owner)
- **Auth:** only admins log in (email + password, JWT `Authorization: Bearer`). Staff do not log in. Login is rate-limited (10 / 15 min).
- **Staff roles:** `CLEANER` or `DRIVER`. Role is locked once the person has any booking. Staff with booking history cannot be deleted — deactivate instead. Cannot deactivate someone with upcoming non-cancelled, non-completed bookings.
- **Bookings:**
  - Cleaners: 1–20 per booking. In the form, the admin just ticks cleaners and `cleanerCount` is **set automatically** to the number ticked (shown read-only, and used for the price). The API still requires `cleanerIds.length === cleanerCount`. Drivers are optional, 0–10 (`LIMITS.driversMax`). A person cannot be both cleaner and driver on one booking.
  - Only active staff can be newly assigned; inactive staff already on a booking stay on it.
  - **No overlap:** a staff member cannot be on two non-cancelled bookings whose `[startsAt, endsAt)` intervals overlap (back-to-back is allowed). Checked in a transaction with `SELECT … FOR UPDATE` on the staff rows. Cancelled bookings are ignored and saving as Cancelled skips the check.
  - `date` (YYYY-MM-DD) and `time` (HH:mm) are stored as entered, in business local time (UAE, UTC+4, `TZ_OFFSET_MINUTES`). `startsAt/endsAt` are derived for overlap checks.
  - Hours 0.5–12 in 0.5 steps; rate 0–10000 AED with ≤2 decimals.
  - Statuses: Pending, Confirmed, Assigned, On the Way, In Progress, Completed, Cancelled. Payment: Unpaid, Partial, Paid.
- **Money:** total = cleaners × hours × hourly rate, computed in integer **cents** (`shared/src/money.js`). Never add floats. Display with `formatMoney(cents)` → `AED 0.00`.
- **Reports (per date):** cancelled bookings excluded from all values. Per-cleaner amount = **equal share** of the booking total; remainder cents go to the lowest staff ids so shares sum exactly to the total. These are allocated revenue, **not wages**. Completed value counts only Completed bookings. Driver counts are booking assignments, not verified trips.

## URLs: public site + admin (one build)
- `client/src/main.jsx` picks the app by path: **`/admin`, `/admin/*` → admin app** (`AdminRoot.jsx`, `BrowserRouter basename="/admin"`); **everything else → public landing page** (`landing/Landing.jsx`). Each is a lazy chunk.
- Admin links stay written as `/bookings`, `/staff`… — the basename adds `/admin`. Never hard-code `/admin` inside admin code.
- Landing page (planbfacilitymanagement.com): all text, contacts, services and reviews in `client/src/landing/siteConfig.js`; styles in `landing/landing.css` (own logo-based palette, scoped to `.lp`, does not use admin tokens); icons in `landing/icons.jsx`; logo at `client/public/logo.png`. Contact is WhatsApp/phone links only — no form, no API.
- Production: `npm run build` then `npm start` — Express serves `client/dist` and falls back to `index.html` for any non-`/api` path, so `/` and `/admin` both work from the same server.

## Navigation (keep it to these 4)
Dashboard · Bookings · Staff · Reports — defined in `client/src/components/layout/AppLayout.jsx` (`MENUS`).
Do **not** add menus that duplicate a page. The prototype's extra menus were merged:
- Daily Bookings → Bookings date filter (`/bookings?date=`)
- New Booking → top-bar "+ New Booking" button (`/bookings/new`)
- Payments → payment column + filter on Bookings
- Cleaner View / Driver View → Staff › View jobs (`/staff/:id/jobs`)

## Style rules
- Dark theme ported from `legacy/index.html`. All colours, radii and sizes are CSS variables in `client/src/styles/tokens.css` — **never hard-code colours** in components; add a token instead.
- Class names live in `client/src/styles/global.css` (`.panel`, `.cards`/`.stat`, `.btn` / `.secondary` / `.danger` / `.small`, `.field`, `.grid`, `.filters`, `.tag`, `.chip`, `.scrollstaff`, `.notice` / `.error` / `.success`, `.tablewrap`). Reuse them; no CSS frameworks, no inline colour styles.
- Use the primitives in `client/src/components/ui/index.jsx`: `Panel`, `StatGrid`/`StatCard`, `Field` (label + control + inline error), `Notice`, `ErrorNotice`, `Loading`, `StatusTag`, `PaymentTag`, `ConfirmDialog`. Feedback via `useToast()`. Never use `alert()`/`confirm()`.
- Forms: `noValidate` on `<form>`, `<Field label required error={errors.x}>`; show the first error per field under the input, a summary `Notice type="error"` above the buttons, disable submit while saving. After first submit, errors update live.
- Layout: 235px sidebar; breakpoints 850px (sidebar becomes top bar, grids → 1–2 cols) and 480px. Tables always inside `.tablewrap`. Elements with `.no-print` and buttons are hidden when printing.
- **Every data table has pagination** below it, using `components/ui/Pagination.jsx` (default 10 rows; sizes 10/25/50/100; "Showing x–y of n"). Exception: the Dashboard "recent 8" summary.
  - Lists that can grow without limit (Bookings, Staff › View jobs) page **on the server**: `page` and `pageSize` query params, response `{ items, total, page, pageSize }`, pageSize max 100. Summary numbers (stat cards) must be calculated on the server over all matching rows, never from the current page.
  - Small lists that are already loaded in full (Staff directory, Reports tables) page in the browser with `hooks/usePagination.js`. Reports render every row and hide off-page rows with `.pg-hidden`, so Print / Save PDF still includes all of them.
- **Table row actions are icon buttons**: `<IconButton icon title to|onClick variant />` from `components/ui/Icon.jsx`. A `title` is **required**: it's the hover tooltip and the screen-reader label, and it should name the action and the target, e.g. "Delete booking BK-…". Use the same icon for the same action everywhere: `edit` = manage/edit, `trash` = delete/remove (`variant="danger"`), `jobs` = view assigned jobs, `eye` = show details, `userOff`/`userOn` = deactivate/reactivate. When an action isn't allowed, keep the icon visible but disabled, and use the title to explain why. Put the actions column last, with `className="actions-col"` (one line, no wrapping). Add new glyphs to `PATHS` in `Icon.jsx` (inline SVG; no icon library). Filter and utility buttons (Today, Clear filters, Log out) stay as text buttons.
- **Staff page** keeps the add/edit form (300px card, `.staff-layout`) beside the directory, using `.compact-form` fields and a `.table-compact` table with search and a role filter. It must fit one screen at 1280×720 with 10 rows per page.
- Form footers: secondary actions (Delete, booking code) and messages on the left; **Cancel + primary Save on the right** (`.bf-actions`).
- Staff multi-select uses `components/booking/StaffPicker.jsx` (header with "N / max selected" + Clear, optional search, fixed-height scroll list, optional chips).
- **Booking form must fit one screen without page scroll** on 1280×720 and up. It uses a compact 3-column layout (`.booking-form`, `.bf-cols`: Customer · Schedule & price · Assign staff) with small fields grouped in rows (`.bf-row`, `.bf-row.three`) and a footer bar (`.bf-foot`) for buttons and errors. Below 1150px it becomes 2 columns, and below 700px 1 column (scrolling is fine there). When adding a field, put it in a row next to another short field. Don't add a full-width field or make the staff lists taller.
