# CleaningOS — Booking Manager

React + Node.js (Express) + MySQL app for managing a cleaning company's daily bookings, staff (cleaners & drivers) and reports.

## Requirements
- Node.js 20+
- MySQL 8 (Laragon's MySQL works out of the box: user `root`, no password)

## Setup
```bash
# 1. Create the database (Laragon terminal or HeidiSQL)
mysql -uroot -e "CREATE DATABASE cleaningos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Install
npm install

# 3. Configure the API
cp server/.env.example server/.env
#    edit server/.env → set JWT_SECRET to a long random string, and SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD

# 4. Create tables and the first admin
npm run db:migrate
npm run db:seed

# 5. Run (API on :4000, web app on :5173)
npm run dev
```
Open http://localhost:5173 and sign in with the seeded admin. **Change the seed password** for real use.

## Scripts (root)
| Command | What it does |
|---|---|
| `npm run dev` | API + web app with live reload |
| `npm run build` | Production build of the web app → `client/dist` |
| `npm start` | Run the API without watch |
| `npm run db:migrate` | Apply / create Prisma migrations |
| `npm run db:seed` | Create first admin + demo staff (safe to re-run) |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Structure
```
shared/   Zod validation schemas + constants (used by client and server)
server/   Express API — routes → controllers → services → Prisma
client/   React app — pages, components, api, hooks, styles
legacy/   Original HTML prototype (reference only)
```
See [CLAUDE.md](CLAUDE.md) for business rules, conventions and style guide.
