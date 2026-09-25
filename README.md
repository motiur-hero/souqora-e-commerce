# Souqora — Full E-Commerce Platform

A production-grade, full-stack e-commerce platform built with **Next.js 14 (App Router)**,
**Prisma**, and **SQLite** (swappable for Postgres/MySQL in production). It includes a
customer storefront, a secure admin dashboard, real inventory/order/payment logic, manual
**bKash** payment, **Cash on Delivery**, coupons, reviews, and reports.

> ⚠️ This project was generated in an offline sandbox with no network access, so it has
> **not been `npm install`'d, run, or tested**, and it has **not** been pushed to GitHub or
> deployed. Follow the steps below on your own machine to do all three.

---

## 1. What's included

- **Storefront**: home, shop (search/filter/sort), product detail, cart, checkout
  (COD + manual bKash), order confirmation, about/contact/FAQ, shipping/return/privacy/terms
  pages, sitemap.xml + robots.txt, per-product SEO fields + JSON-LD.
- **Admin dashboard** (`/admin`, JWT-protected): stats dashboard, product CRUD (with
  duplicate + delete confirmation), categories, inventory (manual add/reduce + history log),
  orders (status workflow with automatic stock restore on cancel/return), payments
  (verify/reject bKash transactions), customers (block/unblock), coupons, review moderation,
  daily/weekly/monthly/yearly sales charts, and store settings (shipping, bKash number,
  policies, etc — all editable, nothing hardcoded in the UI).
- **Database** (Prisma schema): AdminUser, Customer, Category, Product, ProductImage,
  ProductVariant, InventoryLog, Order, OrderItem, Coupon, Review, StoreSettings.
- **Security**: bcrypt-hashed admin password, JWT session in an httpOnly cookie, all
  `/admin/*` routes except `/admin/login` are blocked by middleware without a valid session,
  no secrets in the frontend, everything sensitive comes from environment variables.

### Scope notes (what's simplified)

- **Cart storage**: cart contents live in the browser (localStorage) until checkout — this is
  standard practice and does not violate "no localStorage as primary database," since the
  actual persistent records (products, orders, inventory, payments) all live in the SQL
  database via Prisma.
- **Image uploads**: images are added by pasting URLs (comma-separated) rather than a binary
  file-upload pipeline, to keep the project runnable without a cloud storage bucket. Swap in
  S3 / Cloudinary / Vercel Blob and wire it into `ProductForm.tsx` when you're ready.
- **bKash**: implemented exactly as specified — **manual** payment. The customer sends money
  to the store's bKash number and submits a Transaction ID; the admin verifies it in
  `Admin → Payments`. No real bKash API is connected (add one later via `BKASH_API_KEY` /
  `BKASH_API_SECRET` if you get merchant API access).

---

## 2. Run it locally

**Requirements**: Node.js 18+, npm.

```bash
cd souqora-ecommerce
cp .env.example .env
# edit .env — at minimum set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npm run db:push     # creates dev.db (SQLite) from the Prisma schema
npm run db:seed      # creates your admin user + demo categories/products
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin/login — log in with the `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` you set in `.env` (the seed script hashes and stores that password).

## 3. Push to GitHub (`motiur-hero/souqora-ecommerce`)

This wasn't done for you (no network access in the build sandbox). From your machine:

```bash
cd souqora-ecommerce
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/motiur-hero/souqora-ecommerce.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.env`, and the local SQLite database file, so
none of those will be committed. Double-check `git status` before your first push.

Suggested follow-up commits as you extend the project (matching the spec's examples):
`Create storefront`, `Create product management`, `Create inventory system`, `Create checkout`,
`Add bKash manual payment`, `Add COD`, `Create admin dashboard`, `Add order management`,
`Add GitHub deployment configuration`, `Production release`.

## 4. Deploy to production

The project runs on any Node host. Two common paths:

### Option A — Vercel (easiest for Next.js)
1. Import the GitHub repo at vercel.com.
2. Set environment variables in the Vercel dashboard (`DATABASE_URL`, `JWT_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BKASH_NUMBER`).
3. **Swap SQLite for Postgres** — SQLite's file-based DB doesn't work on serverless. Provision
   a Postgres database (Vercel Postgres, Neon, Supabase, etc.), set `DATABASE_URL` to it, and
   change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
4. Vercel runs `npm run build` (which runs `prisma generate` first) automatically.
5. After the first deploy, run migrations once against production:
   `npx prisma db push` (with `DATABASE_URL` pointed at production) and then
   `npm run db:seed` to create your admin user.

### Option B — Traditional Node host (VPS / Railway / Render)
1. Provision a Postgres (or MySQL) database; set `DATABASE_URL`.
2. Update `prisma/schema.prisma`'s `provider` to match.
3. `npm install && npm run build && npm run db:push && npm run db:seed`
4. `npm run start` (or let the platform run it) behind your usual reverse proxy / process
   manager.
5. Point your domain at it and enable HTTPS.

I have not performed either of these deployments myself, and I won't claim a live URL exists
until you've actually run these steps and confirmed the site is reachable.

## 5. Environment variables

See `.env.example`. Never commit a real `.env` file — `.gitignore` already excludes it.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path locally; Postgres/MySQL connection string in production |
| `JWT_SECRET` | Signs admin session cookies — use a long random string in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `npm run db:seed` to create the first admin user |
| `BKASH_NUMBER` | Default manual bKash number (also editable later in Admin → Settings) |
| `BKASH_API_KEY` / `BKASH_API_SECRET` | Only needed if you later connect a real bKash merchant API — leave blank for manual payment |

## 6. Day-to-day admin guide

- **Add a product**: Admin → Products → Add Product. Fill in name/SKU/price/stock, paste
  image URLs (comma-separated), pick a category, save.
- **Manage inventory**: Admin → Inventory — add/reduce stock manually; every change is logged.
  Stock also auto-adjusts when orders are placed, cancelled, or returned.
- **Verify a bKash payment**: Admin → Payments — find the order (status "PENDING
  VERIFICATION"), confirm the Transaction ID against your bKash statement, click
  **Verify Payment** (or **Reject Payment** with a note).
- **Manage COD orders**: Admin → Orders — update status (Pending → Confirmed → Processing →
  Shipped → Delivered), add a tracking number. Marking an order **Cancelled** or **Returned**
  automatically restores the stock that was deducted.
- **Update via GitHub**: commit and push changes to `main`; if deployed on Vercel/Railway with
  auto-deploy enabled, the live site updates automatically. Otherwise, pull and redeploy on
  your host.

## 7. Project structure

```
prisma/schema.prisma        Database models
prisma/seed.ts               Creates admin user + demo data
src/lib/prisma.ts            Prisma client singleton
src/lib/auth.ts               JWT session helpers
src/lib/actions/*             Server Actions — the real backend (CRUD, checkout, payments...)
src/app/(site)/*              Customer storefront pages
src/app/admin/*                Admin dashboard pages
src/app/api/coupons/validate  One JSON API route (client-side coupon check at checkout)
src/components/*              Shared UI + client-interactive pieces
src/middleware.ts             Protects /admin/* routes
```
# souqora-e-commerce
