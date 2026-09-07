# KSGPL Catalog — POC

A proof-of-concept catalog management app for **Kundan Switchgears Pvt Ltd
(brand: ODYSSEY)** — built to show a client what's possible, at **$0 cost**.

- **Web app** (Next.js) — public catalog browsing + admin dashboard
- **Mobile app** (Expo / React Native) — same features, one codebase for
  **Android and iOS**
- **Backend** (Supabase) — free Postgres database, auth, storage and REST API

Two user types:

1. **Admin** — signs in, can create/edit/delete catalog types, products
   (with a flexible spec sheet per product), and company/manufacturing-unit
   info.
2. **End users** — browse the catalog and company info with **no sign-up
   required**. Each catalog type shows as its own tab. Search works for both
   admin and end users.

A real product line (Odyssey LED lighting products) from the supplied PDF
catalog is pre-seeded as sample data, plus a second, empty catalog type to
demonstrate that admins can add more product lines beyond the first one.

---

## 1. Architecture

```
ksgpl/
├── apps/
│   ├── web/       Next.js 14 (App Router) — deploys free to Vercel
│   └── mobile/    Expo (React Native) — Android + iOS from one codebase
├── packages/
│   └── shared/    Shared TS types + Supabase queries used by both apps
└── supabase/
    ├── migrations/   SQL schema (tables, RLS policies, storage buckets)
    ├── seed/         Sample catalog data (from the KSGPL PDF)
    └── make_admin.sql
```

Both apps talk directly to Supabase (Postgres + Auth + Storage) using the
public **anon key** — Row Level Security policies enforce that only admins
can write, and only active products are visible to anyone who isn't an
admin. There is no separate backend server to host, which is what keeps
this at $0.

**Why this design is genuinely $0, not "free trial":**
- Supabase free tier: no credit card required, includes Postgres, Auth,
  Storage, and stays free indefinitely (with reasonable usage limits — more
  than enough for a POC).
- Vercel free (Hobby) tier: hosts the Next.js web app with a public URL,
  no cost.
- Expo Go + EAS free tier: run the mobile app on a real phone via the free
  Expo Go app (no Apple/Google developer account needed for a demo), or
  build a free-tier APK for Android via `eas build`.

---

## 2. One-time setup (free Supabase project)

1. Go to [supabase.com](https://supabase.com) and create a free account +
   new project (no credit card required).
2. In the Supabase dashboard, open **SQL Editor** and run, in order:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_storage.sql`
   3. `supabase/seed/seed.sql` (loads the sample Odyssey LED catalog +
      company info)
3. In **Project Settings → API**, copy the **Project URL** and **anon
   public key** — you'll need them for both apps' env files.
4. Create your admin account:
   - In the app (web `/admin/login` or the mobile Admin tab), try signing
     in with an email/password once — this fails to sign in (no account
     exists yet) but you can instead use **Authentication → Users → Add
     user** in the Supabase dashboard to create the account directly
     (set "Auto Confirm User" so no email verification is needed).
   - Then open `supabase/make_admin.sql`, put that email in, and run it in
     the SQL Editor. That row's `role` becomes `'admin'`.
   - Now sign in from the app with that email/password — you'll land on
     the Admin dashboard.
5. (Optional) Add the real product photos: the seeded products start with
   no images. `supabase/seed/product-images/` has 28 photos cropped
   straight from the KSGPL PDF catalog, one per seeded product, plus a
   script that uploads them and attaches each to its matching product.
   Run this from a machine/Codespace that has network access to Supabase
   (a plain `node` script, no extra install needed since
   `@supabase/supabase-js` is already a dependency at the repo root):
   ```bash
   SUPABASE_URL=https://your-project-ref.supabase.co \
   SUPABASE_ANON_KEY=your-anon-key \
   node supabase/seed/upload-images.js admin@example.com 'admin-password'
   ```
   It signs in as that admin (same RLS as the app itself, no service-role
   key needed), uploads each photo to the `product-images` Storage bucket,
   and updates the matching product's `image_url` by name. Safe to re-run.

That's it — no server to deploy for the backend.

---

## 3. Run the web app

```bash
cd apps/web
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install                  # (or run `npm install` once from the repo root)
npm run dev
```

Open http://localhost:3000 — `/catalog` for the public view, `/admin/login`
for the admin dashboard.

**Deploy for free:** push this repo to GitHub, then import it on
[vercel.com](https://vercel.com) (free Hobby plan). Set the project's root
directory to `apps/web`, and add the two env vars
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel
project settings. You'll get a free `*.vercel.app` URL to show the client.

---

## 4. Run the mobile app (Android + iOS)

```bash
cd apps/mobile
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install                  # (or run `npm install` once from the repo root)
npm run start
```

This starts the Expo dev server and prints a QR code.

- **On your phone:** install the free **Expo Go** app (App Store / Play
  Store), then scan the QR code. The app opens instantly — no developer
  account, no build step, no cost.
- **On a simulator:** press `a` (Android emulator) or `i` (iOS simulator)
  in the terminal if you have Xcode/Android Studio installed locally.

**Getting an installable APK for a client demo (still free):**
```bash
npm install -g eas-cli
eas login          # free Expo account
eas build --platform android --profile preview
```
EAS's free tier includes a limited number of builds/month — plenty for a
POC handoff. iOS builds require a paid Apple Developer account ($99/yr) only
if you want to install outside Expo Go / TestFlight — for a POC demo, Expo
Go is the $0 path for iOS too.

---

## 5. How the data model maps to the requirements

| Requirement | Implementation |
|---|---|
| Admin CRUD on catalog + company/manufacturing info | `catalog_types`, `products`, `company_info` tables; only `role = 'admin'` profiles can write (enforced by Postgres Row Level Security, not just the UI) |
| End users can view catalog + company info | Public `select` RLS policy on those tables — no login needed |
| Multiple catalog types, admin can add more | `catalog_types` table; each row is a tab in both apps. Seeded with "LED Lighting Products" (from the PDF) + an empty "Raw Materials & Components" example |
| Each catalog viewable in its own tab | `CatalogTabs` component (web) / tab bar (mobile) driven by `catalog_types` |
| Search for admin and end user | `listProducts()` in `packages/shared` does an `ILIKE` search across product name, category, description, and a flattened text version of the flexible spec sheet (`specs` JSONB column) |
| Products with very different attribute sets (wattage, beam angle, dimensions, IP rating, etc.) | `products.specs` is a JSONB key/value map, edited via a dynamic "add spec row" UI in admin — no schema migration needed per product type |

---

## 6. Notes / next steps for a production version

This is intentionally minimal for a POC:
- Product images upload to public Supabase Storage buckets
  (`product-images`, `company-images`); a production build would add
  size/type limits and CDN caching rules.
- Search is `ILIKE`-based, fine for a catalog of hundreds of items; a large
  catalog would want Postgres full-text search or a search service.
- There's no pagination on product lists yet — fine at POC scale.
- Admin accounts are promoted manually via SQL (`make_admin.sql`) rather
  than through an invite flow — enough for a POC with 1–2 admins.
