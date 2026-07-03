# Sound Works Car Audio Solutions

Inventory, billing (POS), and serial-number warranty management for Sound Works Car Audio Solutions.

127/D, Kotalawala, Kaduwela · +94 76 995 5588

## Stack

- **Next.js 16** (App Router, Turbopack) — note the `middleware` file convention is renamed to **`proxy`** in v16; see `src/proxy.ts`.
- **TypeScript** + **Tailwind CSS 4**
- **PostgreSQL** via **Prisma 7** — v7 has no bundled query engine binary; the DB connection is owned by a driver adapter (`@prisma/adapter-pg`) passed into `PrismaClient`, and the generated client lives at `src/generated/prisma` (git-ignored, regenerated on `npm install` via `postinstall`).
- **Auth.js (next-auth v5)** — credentials login, JWT session carries a `role` (`ADMIN` | `SALES`).
- **Zod** for input validation on all server actions.

## Device-based access

`src/proxy.ts` inspects the request's User-Agent on every request:

- **Mobile devices** are routed to `/pos` (billing) and `/stock` (read-only stock lookup) — the `(mobile)` route group.
- **Desktop/tablet** and role `ADMIN` get the full dashboard — the `(desktop)` route group: `/dashboard`, `/inventory`, `/reports`, `/warranty`.
- Role `SALES` is redirected away from desktop admin routes even if opened on a desktop browser — device adapts the *default* view, role enforces the *ceiling*.

## Getting started

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # fill in DATABASE_URL and AUTH_SECRET
npx auth secret             # generates AUTH_SECRET if you don't have one
npm run db:migrate          # creates the database schema
npm run db:seed             # creates an admin + sales user and sample inventory
npm run dev
```

Seeded logins (from `prisma/seed.ts`):

| Role  | Email                  | Password  |
| ----- | ---------------------- | --------- |
| ADMIN | admin@soundworks.lk    | admin123  |
| SALES | sales@soundworks.lk    | sales123  |

Open [http://localhost:3000](http://localhost:3000). Resize your browser below ~768px (or open on a phone) to see the mobile POS/stock views; the proxy will route you automatically.

## Logo

Save the shop logo as `public/logo.png` — it isn't included in this scaffold since it was shared as an inline image, not a file.

## Data model (`prisma/schema.prisma`)

- **Product** — the catalog entry (name, brand, category, SKU, default warranty months).
- **InventoryUnit** — one row per *physical, serialized* item (never a quantity count), with a unique `serialNumber` and a `status` (`IN_STOCK`, `SOLD`, `IN_REPAIR`, `RETIRED`).
- **Invoice** / **InvoiceItem** — a sale; `InvoiceItem` links one `InventoryUnit` to the invoice and freezes the sale price and warranty length at time of sale, so later edits to `Product.warrantyMonths` never retroactively change a customer's existing warranty.
- **WarrantyClaim** — logged against an `InventoryUnit`; the warranty desk (`/warranty`) computes Active/Expired from `Invoice.date + InvoiceItem.warrantyMonths` rather than storing a redundant expiry date.

## Project structure

```
prisma/
  schema.prisma
  seed.ts
prisma.config.ts              # Prisma 7 CLI config (schema path, migrations, seed command)
src/
  proxy.ts                    # device + role routing (replaces middleware.ts in Next 16)
  app/
    login/page.tsx
    (mobile)/layout.tsx        # bottom nav + footer
    (mobile)/pos/page.tsx       # billing / cart / invoice
    (mobile)/stock/page.tsx     # read-only stock search
    (desktop)/layout.tsx       # sidebar + footer
    (desktop)/dashboard/page.tsx
    (desktop)/inventory/page.tsx
    (desktop)/inventory/[id]/page.tsx
    (desktop)/reports/page.tsx
    (desktop)/warranty/page.tsx
    api/auth/[...nextauth]/route.ts
  components/
    layout/  pos/  inventory/  warranty/
  lib/
    prisma.ts   auth.ts   device.ts   business.ts
    actions/    # server actions: pos.ts, stock.ts, inventory.ts, warranty.ts
  types/next-auth.d.ts        # augments Session/User/JWT with `role`
```
