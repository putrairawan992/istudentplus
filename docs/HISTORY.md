# iStudentPlus.com Revamp — Development History

A chronological log of the Elementor → Next.js + TypeScript rebuild, including SEO/GEO
work, the admin CMS, and the custom API. Written from the working chat session so future
contributors (human or AI) have context without re-reading the whole transcript.

> **Maintenance note:** update this file with every further change/addition to the
> project — that's a standing instruction from the client, not a one-off.

## Project goal

Rebuild `istudentplus.com` (a study-abroad education consultancy) from WordPress/Elementor
to Next.js + TypeScript, with real content (not placeholders), a client-editable CMS, and a
foundation for SEO and GEO (generative-engine optimization).

---

## 1. UI mockup (single HTML artifact)

Before any code, a static HTML mockup explored a visual identity: a "departure board /
boarding pass" concept (airport-style destination board, visa-stamp service cards, ticket
perforation dividers) in navy + amber, built and published as a standalone Artifact.

## 2. Next.js scaffold + real scraped content

- Scaffolded with `create-next-app` (Next.js 16, TypeScript, Tailwind v4, App Router).
- Scraped the live WordPress site for real copy (hero text, stats, services, testimonials,
  nav structure) rather than inventing content. Found and flagged that the live site's own
  logo, contact phone/address, and several destination pages were **leftover theme demo
  data** (from the "EduBlink" Elementor theme) — not real content — and avoided reusing it.
- Rebuilt the homepage in React using that verified real content.

## 3. Full multi-page site

Restructured into a real sitemap: Home, About Us, Study Abroad (+ per-country pages),
Services, Courses & Universities, Language Programs, Blog, Contact. Added basic SEO
metadata and `Organization`/`FAQPage` JSON-LD for GEO. Removed the Google Fonts
dependency (network fetch was flaky in this environment) in favor of system fonts.

## 4. Weekly reporting artifacts

Produced two client-facing documents (kept in `docs/`):
- `docs/scope-mingguan-istudentplus.docx` — weekly scope-of-work doc.
- `docs/istudentplus-weekly-update.pptx` — a designed slide deck (navy + pink brand
  palette pulled from the real logo) summarizing progress, corrections vs. the old site,
  and the next week's day-by-day plan.

## 5. Client PPTX brief → real assets and copy

The client shared `iStudentPlus Website Development.pptx` (a full site-structure brief) over
WhatsApp. Every slide was read and cross-checked against what had been built:
- Extracted **real assets** directly from the deck: Nur Fadillah's photo, 4 real English
  instructor headshots, the certifications strip (Law Society NSW, QEAC #12929, ISEAA,
  Australia FutureUnlimited), and destination photos (cropped from the deck's mega-menu,
  plus Unsplash for Japan/China since the deck didn't cover them).
- Corrected data that earlier scraping had gotten wrong — most importantly the real
  offices are **Pangkalpinang & Makassar** (not Sydney), and the real team is **Cindy
  Christella (CEO)** and **Nur Fadillah**.
- Rebuilt the nav to match the brief's menu exactly (dropdown submenus for Study Abroad,
  Services, Language Programs, Blog).
- Added real course durations/features (General English, IELTS, Conversation, JLPT), real
  visa services (including partners IMMagine Immigration and Middow), and Australia-specific
  Key Facts / cost-of-living / visa-requirements tables.
- Annotated a copy of the client's own guide PPTX with a status banner on every slide
  (Done / Partial / Backlog) plus a summary slide — saved as
  `docs/istudentplus-website-guide-status.pptx`, without touching the client's original file.

## 6. UI/UX restyle to match the brief's visual references

Re-implemented several sections to mirror the *visual* references embedded in the client's
PPTX (not just the copy): a hero with a real student photo over organic brand-color blobs,
pastel service cards, a vertical numbered journey timeline, and "Kobi-style" testimonial
cards (avatar + badge + a "Raih LoA:" checklist). Added navy/orange Vision & Mission cards
and an accordion FAQ on the About/Services pages.

## 7. Responsive QA + first commit

Systematically checked all pages at 375px (mobile) and 768px (tablet): no horizontal
overflow anywhere, and a working hamburger menu with expandable submenus added for
viewports below the `xl` breakpoint (this was a real regression found and fixed — narrowing
the desktop nav breakpoint had briefly left tablet widths with no navigation at all).
Fixed a text-overflow bug where long office names ("Pangkalpinang") broke out of their
card at narrow widths. This was the first point the changes were committed and pushed to
`origin/main`.

## 8. Admin CMS (`/admin`)

Built a self-contained CMS rather than adopting a third-party headless CMS, since content
was already file-based and the goal was "put today's data into a CMS the client can use,"
not a new infrastructure dependency:

- **Auth**: single admin user, credentials in `.env.local` (gitignored) — a random
  password, scrypt-hashed, checked against a signed session cookie (HMAC, 12h TTL).
  Route protection via `proxy.ts` (this Next.js version's renamed `middleware.ts`).
- **Storage**: one JSON file per collection under `content/`, read/written through
  `lib/content.ts`. Nine collections seeded from the data already live on the site:
  settings, countries, testimonials, team, homeServices, visaServices, languagePrograms,
  instructors, blog.
- **Editor**: one generic, recursive editor component
  (`app/admin/components/CollectionEditor.tsx`) infers the right input for any JSON shape
  (text vs. textarea, repeatable string lists, repeatable object cards, nested objects) —
  so the same component drives every collection, including the deeply nested `countries`
  data (per-country `overview`, `keyFacts`, `livingCosts`, `visaRequirements`,
  `featuredPrograms`).
- **Bug found and fixed during testing**: pages originally read CMS content in a top-level
  `const X = readContent(...)`, which only runs once per server process — edits saved in
  the CMS didn't show up on the live pages without a server restart. Fixed by moving every
  `readContent()` call inside the page component's function body, and converting
  `study-abroad/data.ts`'s `COUNTRIES` export into a `getCountries()` function. Verified
  with a real edit → save → live-page-reflects-it round trip, with no server restart.

## 9. Google Docs update — blocked, worked around

Asked to check off completed items and update weekly/next-week/week-after planning in a
shared Google Doc. The browser session had **view-only** access (not logged into any
Google account), and there is no Google Docs write API available in this environment —
entering Google credentials was correctly refused. Instead, updated the equivalent
`docs/scope-mingguan-istudentplus.docx` locally with an honest checklist (done vs. not
done) and three weeks of planning (this week / next week / the week after), for the user
to paste into the Google Doc themselves.

## 10. Custom API (`/api/leads`)

Clarified what "add our own API" meant (an API for this Next.js site, not a separate
subdomain or a Cloudflare Worker), then implemented it as a real example rather than just
an explanation:
- `app/api/leads/route.ts` — a `POST` Route Handler accepting `multipart/form-data` from
  both the Free Consultation form and the Contact form. Validates name/email, optionally
  saves an attached CV to a top-level `uploads/` folder (outside `public/`, so it isn't
  guessable/downloadable by URL, and gitignored since it's user PII), and appends the
  submission to `content/leads.json`.
- Because `leads` is just another CMS collection, submissions show up for free in
  `/admin/leads` using the same generic editor — no extra admin UI needed.
- `ConsultationForm.tsx` and the new `ContactForm.tsx` were converted to client
  components that actually submit to this endpoint, with loading/success/error states.
  Verified end-to-end: submit → success message → entry appears in `content/leads.json`
  → visible in `/admin/leads`.

## 11. Services page — finished wiring to the CMS

A user check ("this page still isn't hooked up") caught that `visaServices` was CMS-driven
but three smaller pieces of the Services page — pitfalls to avoid, admission steps, and the
FAQ — were still hardcoded. Added a tenth collection, `servicesPage` (single object:
`pitfalls[]`, `admissionSteps[]`, `faqs[]`), registered it in the CMS, and rewired the page.
Verified with a live edit → save → reflected-on-`/services` round trip.

## 12. Stale Server Action error in dev

User hit `Runtime UnrecognizedActionError: Server Action "..." was not found on the
server` when opening a collection editor in `/admin`. This is a known Next.js +
Turbopack dev-mode artifact: after enough hot-reloads in one dev session, the Server
Action ID baked into the already-loaded client bundle can drift from what the (recompiled)
server has registered — not a bug in `CollectionEditor.tsx` or `actions.ts`. Fixed by
clearing `.next` and restarting the dev server; confirmed with a fresh login → open a
collection → Save round trip. If it recurs, a hard refresh (Ctrl+Shift+R) is usually
enough without a full restart.

## 13. Admin CMS UI/UX revamp

Client felt the CMS looked flat and was tiring to use. Reworked it without new
dependencies:
- **Metadata**: added an `icon` (emoji) and `group` (General / Content / Inbox) to each
  entry in `lib/collections.ts`, reused by both the sidebar and the dashboard.
- **Sidebar** (`app/admin/components/Sidebar.tsx`, new client component): grouped nav with
  icons and **active-route highlighting** (`usePathname`), a branded header, sticky on
  desktop, and a hamburger drawer with backdrop on mobile. Layout became a thin shell.
- **Dashboard**: navy gradient welcome header with collection/lead counters, plus
  icon cards grouped by section with hover lift.
- **Editor** (`CollectionEditor.tsx`): list entries are now **collapsible accordion cards**
  with a title derived from the entry's most title-like field (collapsed by default when a
  list has > 3 entries, so long collections stay scannable); a **sticky action bar** with a
  dirty/"Unsaved changes" indicator; and — per client request — a **per-entry Save button**
  (header + footer of each card) so you don't scroll back to the top to save. Object fields
  now render in a **2-column responsive grid** (wide fields — textareas, lists, nested
  objects — span the full row), roughly halving the scroll length of a form. Note: a per-entry
  save still persists the whole collection file (storage is whole-file JSON); the button is
  UX granularity, not a partial write.

## 14. Go + PostgreSQL backend (persistent storage)

Client wanted the CMS and the public site to stay consistent on a real host, not file-based
JSON (which doesn't persist on serverless / read-only filesystems). Chose a **separate Go +
Postgres backend** (over the leaner "Next.js talks to Postgres directly" option) at the
client's request, exposed at `https://api.istudentplus.com`.

- **Service** (`backend/`): a ~180-line stdlib `net/http` service (no web framework) over
  Postgres via `pgx`. One table, `content(collection TEXT PK, data JSONB, updated_at)` —
  mirrors the old one-file-per-collection model exactly. Routes: `GET /health`,
  `GET /content/{key}` (public reads), `PUT /content/{key}` (writes, `Bearer` token). Starter
  content is embedded (`go:embed seed/*.json`) and seeded only when a collection is absent, so
  restarts never clobber CMS edits; `leads` starts empty (no PII in the repo/image). A unit
  test on the auth gate caught a real bug — a token sent without the `Bearer ` prefix
  authenticated — fixed to require the prefix (`strings.CutPrefix`).
- **Auth model**: the browser never calls Go directly. Public pages read server-side; the
  admin writes through the existing Next.js server action, which calls Go with a bearer token.
  Admin login stays in Next.js unchanged.
- **Deploy** (`backend/`): Docker Compose (Postgres 16 + Go app + **Caddy** for automatic
  Let's Encrypt TLS) — one `docker compose up -d --build`. Runbook + Cloudflare DNS steps in
  `backend/README.md`.
- **Next.js integration**: `lib/content.ts`'s `readContent`/`writeContent` became **async** —
  they hit the API when `CONTENT_API_URL` is set, else fall back to local JSON files (local
  dev needs no backend). Every caller across the site (`page.tsx`, About, Blog, Contact,
  Services, Language Programs, Study Abroad + per-country, Footer, admin dashboard/editor,
  `/api/leads`) was updated to `await`; `getCountries`/`getCountry` and `generateStaticParams`
  are now async.

---

## Current CMS collections (`/admin`)

| Collection | Kind | Used on |
|---|---|---|
| `settings` | single | Home, About, Contact |
| `countries` | list | Home, Study Abroad |
| `testimonials` | list | Home |
| `team` | list | About Us |
| `homeServices` | list | Home |
| `visaServices` | list | Services |
| `servicesPage` | single | Services |
| `languagePrograms` | list | Language Programs, Home |
| `instructors` | list | Language Programs |
| `blog` | list | Blog |
| `leads` | list | Home, Contact (form submissions) |

## 15. Backend deployed to production (2026-07-23)

Deployed the Go + Postgres backend to the Ubuntu 24.04 server (170.64.181.117) at DigitalOcean:

- **SSH + SCP**: uploaded `backend/` folder to server, installed Docker via `get.docker.com`.
- **`.env`**: set `POSTGRES_PASSWORD` (client-provided) and generated a random `API_TOKEN`
  (`openssl rand -hex 32`).
- **DNS**: added A record `api.istudentplus.com` → `170.64.181.117` (DNS only / grey cloud)
  in Cloudflare. Initially the domain resolved to Cloudflare proxy IPs (172.67.160.154) —
  toggling the record from proxied (orange) to DNS-only (grey) fixed it.
- **Caddy SSL**: after DNS propagated, Caddy automatically obtained a Let's Encrypt
  certificate via HTTP-01 challenge. First attempt failed because DNS was still pointing to
  Rebrandly; succeeded on retry after DNS fix.
- **Port exposure**: added `ports: ["8080:8080"]` to the API service in `docker-compose.yml`
  as a convenience for direct IP access (`http://170.64.181.117:8080`), alongside the main
  Caddy HTTPS gateway.
- **Verification**: `GET /health` → `"ok"`, `GET /content/settings` → live JSON from Postgres,
  `https://api.istudentplus.com` serving with valid TLS (Let's Encrypt, auto-renew).
- **Frontend wiring**: wrote `CONTENT_API_URL=https://api.istudentplus.com` and
  `CONTENT_API_TOKEN=<generated>` into `.env.local` at the project root — the Next.js app now
  reads and writes through the live API. No code changes needed; `lib/content.ts` already
  handled the API-vs-local-files switch via env vars.

## 16. Last hardcoded blocks moved into the CMS

The three content blocks flagged in the backlog as still hardcoded were pulled into the CMS
so they're editable and served from the API like everything else. Three new collections in
`lib/collections.ts` / `lib/content.ts` (+ `content/*.json` seeds + `backend/seed/*.json` +
the Go `collections` allowlist in `backend/main.go`):
- `coursesPage` (single) — Courses & Universities page: qualification types, popular fields,
  VET levels, VET fields, high-school tiers. `app/courses/page.tsx` is now async.
- `englishSkills` (list) — the 4 General English skill cards on Language Programs.
- `videoSeries` (list) — the Blog's Abroad Stories / Scholarships video cards.

> **Deploy note:** the Go allowlist and seeds are compiled into the running binary, so these
> three pages 500 against production until the backend is rebuilt + redeployed
> (`docker compose up -d --build`). Verified locally by pointing at local JSON files.

## Known limitations / backlog

- **CMS storage:** now backed by the Go + Postgres API (§14-15) when `CONTENT_API_URL` is set,
  which persists edits properly. Falls back to file-based JSON for local dev when unset.
  ✅ Deployed and live at `https://api.istudentplus.com`.
- **No lead notifications.** Form submissions save to `content/leads.json` / `/admin/leads`
  but nothing pings the team — no email/WhatsApp alert on a new submission yet.
- **Cindy Christella's photo and bio** are still an honest placeholder — not fabricated,
  genuinely missing from the client's own materials.
- **Contact info beyond WhatsApp** (office phone/email/street address) hasn't been
  confirmed by the client — the old WordPress site's version of this was leftover theme
  demo data, not real, so it was deliberately not reused.
- **No sitemap.xml, robots.txt, or llms.txt yet** — the SEO/GEO foundation so far is
  per-page metadata plus `Organization`/`FAQPage` JSON-LD only.
- **No staging deployment, analytics, or custom domain wiring yet** — Cloudflare is
  managing the `istudentplus.com` domain, but the Next.js app hasn't been deployed there
  (or anywhere) beyond local development.
- **Language Course Enrollment** (registration → payment → calendar) is fully deferred —
  needs a payment gateway decision from the client first.

## Admin access

Login at `/admin` (redirects to `/admin/login` if not authenticated). Username and the
generated password are in `.env.local` at the project root (gitignored — not reproduced
here since this file is committed to the repo).
