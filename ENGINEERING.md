# ENGINEERING.md — Amar X Split, real architecture reference

This file is maintained but can lag reality. Trust it as the current picture, but grep or read
the actual files before a change that depends on exact behavior — especially in the "Known gaps"
section below, which is the part most likely to go stale. Update this file whenever an
architecture-level change lands (new route, schema change, payment flow change, etc.).

See `CLAUDE.md` for tech stack, commands, and conventions.

---

## Business model

Two offers, both delivered as one protected PDF ("Amar X Split") viewed in the customer portal:

- **Offer 1 — Training Plan**: the PDF only, 499 LE, one-time payment, lifetime access.
- **Offer 2 — Personal Coaching**: the PDF + 3 months of coaching, 2,499 LE, conducted **entirely
  over WhatsApp** (no in-app check-ins/nutrition tracking — deliberately out of scope).

The customer portal's core design goal is **anti-piracy**: prevent the PDF from being downloaded,
screenshotted, or shared outside the paying customer's session. See "The PDF pipeline" below.

---

## Auth model

NextAuth v5, JWT session strategy, two providers, both in `src/lib/auth.ts`:
- **Google OAuth**: open to anyone — any Google email can sign in. On sign-in (`signIn`
  callback), an email in the `ADMIN_EMAILS` allowlist env var is upserted as `ADMIN`; every other
  email is find-or-created as a plain `CUSTOMER` (deliberate lead capture — a visitor who signs in
  out of curiosity or for a marketing incentive becomes a `User` row the admin can see/target in
  Admin → Customers, even with zero orders). Signing in with Google **does not** grant PDF access
  by itself — `/api/split`'s `hasSplitAccess()` check is entirely separate and still requires an
  ACTIVE, non-expired `Entitlement`, created only by a real purchase (PayPal auto-confirm or admin
  manual confirm of an InstaPay/Telda screenshot). A marketing banner (`GoogleLeadBanner.tsx`,
  shown on public pages only, 5s delay, 7-day dismiss cooldown via localStorage) invites
  unauthenticated visitors to sign in with Google for a "15% off" incentive — today this is lead
  capture only, no coupon/discount code is actually issued or enforced at checkout; a human
  (currently the admin) follows up with the actual code. Building a real automatic-discount system
  (coupon codes, checkout price adjustment, redemption tracking) is a distinct follow-up feature,
  not yet built.
- **Credentials** (email + password): customers who received a temp password by email after
  purchase can still log in this way. `authorize()` does a real DB lookup + bcrypt compare only —
  no hardcoded fallback credentials exist. (Previously there were hardcoded admin/demo accounts
  and an unauthenticated `/api/dev-login` cookie-setter; both were removed.)

`src/lib/auth.config.ts` holds the edge-safe config used by `src/middleware.ts` (route protection
only, no DB/bcrypt access — must stay edge-safe, no `@/lib/db` or `bcryptjs` imports here).
`src/lib/auth.ts` holds the full config with providers and DB-dependent callbacks. Both pull the
session secret from `src/lib/auth-secret.ts`, which throws at startup if `AUTH_SECRET`/
`NEXTAUTH_SECRET` is unset in production (no silent fallback to a guessable default).

`src/middleware.ts` matcher protects: `/admin/:path*`, `/app/:path*`, `/api/admin/:path*`,
`/api/customer/:path*`, `/api/split/:path*`. Role checks: `/admin*`/`/api/admin*` require
`ADMIN`; everything else in the matcher requires any authenticated user (`ADMIN` or `CUSTOMER`)
— finer per-resource checks (e.g. entitlement checks) happen inside the route handlers themselves
via `src/lib/auth-guard.ts`'s `requireAdmin()`/`requireCustomer()`/`requireAuth()`.

The public navbar's "Admin"/"Dashboard" quick-links (previously kept deliberately visible during
active development) were removed on 2026-08-31 — the user asked for the public nav decluttered to
look like a real production marketing site. `/admin` and `/app` are still reachable by URL directly
(and behind their normal auth gates), just no longer advertised as buttons on the public homepage.

---

## Route map

### Public site
- `/` — landing page, all sections in `src/components/sections/`, content sourced from CMS
  (`SiteContent`) via `useSiteContent()` with `translations.ts` as fallback.
- `/checkout/split`, `/checkout/coaching` — the two checkout funnels every homepage CTA links to.
- `/checkout/return` — PayPal return page: captures the payment, polls for webhook confirmation.
- `/login` — Credentials + Google sign-in.

### Customer portal (`/app`, requires auth)
- `/app` — dashboard home (static).
- `/app/my-split` — the actual product: renders the plan PDF via `PdfCanvas`
  (`src/components/client/PdfCanvas.tsx`, pdf.js) fetching bytes from `GET /api/split`, with a
  per-viewer watermark drawn onto every rendered page (see "The PDF pipeline").
- `/app/account` — real order/entitlement data from `/api/customer/orders` and
  `/api/customer/entitlements`; "Active Plans" renders only real, non-expired entitlements.

### Admin panel (`/admin`, requires ADMIN)
`orders`, `customers` (+ `[id]` detail), `products`, `programs` (TrainingProgram/Day/Exercise
builder — real CRUD, kept as admin-only backend; not the customer-facing delivery mechanism, see
Known gaps), `media` (file uploads → `MediaAsset`, local disk `private_media/`, protected by
default — for entitlement-gated files like the split PDF, not public homepage images), `cms`
("Site Editor" — the real homepage rendered full-size in an iframe; clicking Edit makes every
CMS-linked text directly editable in place and every CMS-linked image show a hover "Change Image"
overlay, no separate form — see "The CMS / Site Editor" below), `settings` (`Setting` key-value
store, the real source of truth for WhatsApp/payment contact info and social links — also hosts
the "Training Plan File" PDF uploader).

The old form-based CMS editor (a ~150-field form next to a scaled-down iframe preview) and its
separate `/admin/preview` page were removed — see "The CMS / Site Editor" below for what replaced
them and why.

### API surface, grouped
- **Auth**: `/api/auth/[...nextauth]`.
- **Public**: `/api/products` (list, includes live `price`), `/api/site-content` (published CMS
  content), `/api/settings/public` (non-sensitive Settings for client components — see
  `src/lib/use-settings.ts`), `/api/media/[assetId]` (exercise images/video).
- **Split PDF** (`requireCustomer` + entitlement check): `/api/split` (streams the PDF bytes),
  `/api/split/version` (cheap version marker so `PdfCanvas` can tell when its IndexedDB cache is
  stale without re-downloading).
- **Orders**: `/api/orders` (`POST` creates; `GET ?orderRef=` is a lightweight status poll used by
  the PayPal return page), `/api/admin/orders` (list/confirm/reject/refund).
- **PayPal**: `/api/webhooks/paypal` (signature-verified, activates the order on
  `PAYMENT.CAPTURE.COMPLETED`), `/api/paypal/capture` (called by `/checkout/return` right after
  the customer approves, to actually trigger the capture — see payment state machine below).
- **Paymob**: `/api/webhooks/paymob` still exists (signature-verified) but is unreachable — no
  checkout-initiation code, no merchant account. Out of scope, see Known gaps.
- **Customer** (`requireCustomer`): `/api/customer/orders`, `/api/customer/entitlements`.
- **Admin** (`requireAdmin`): `/api/admin/{products,orders,customers,programs,exercises,media,
  cms,settings,stats,payments}`. `/api/admin/cms/batch` (bulk upsert, always publishes
  immediately) and `/api/admin/cms/upload` (public `public/uploads/` image upload) are the only
  CMS write routes now — the old single-field `/api/admin/cms` route and the unused
  draft/publish flow (`/api/admin/cms/publish`) were dead code and were deleted.

---

## The CMS / Site Editor

`/admin/cms` is the real homepage (`/`) rendered at full size inside an iframe — not a form next
to a shrunken preview. Clicking **Edit** loads the iframe with `?cms_edit=1&cms_lang=en|ar`, which:

- Activates `CmsEditModeProvider` (`src/components/cms/CmsEditModeProvider.tsx`), wrapped around
  the site tree in `layout-shell.tsx`. Every section component wraps its CMS-linked text in
  `<EditableText sectionId fieldId value>` (`src/components/cms/EditableText.tsx`) and every
  CMS-linked image in `<EditableImage sectionId fieldId value alt>`
  (`src/components/cms/EditableImage.tsx`) instead of rendering the raw string/`<img>` directly.
  Outside edit mode both are zero-overhead passthroughs — same DOM, same behavior as before this
  existed.
- In edit mode, `EditableText` becomes `contentEditable` (click to edit, blur/Enter to commit,
  Escape to revert) and `EditableImage` shows a "Change Image" overlay on hover that uploads
  through `/api/admin/cms/upload`. Edits are posted up to the parent `/admin/cms` page via
  `postMessage` (same-origin only) rather than calling the save API directly, so the toolbar owns
  one unified dirty-state/save button across the whole page.
- `?cms_lang=ar` also forces `LanguageProvider` (`src/lib/language-context.tsx`) to display Arabic
  content for editing, overriding the visitor's own saved language preference for the duration of
  that iframe load — this is what lets the admin actually edit the Arabic strings, not just tag
  edits with `lang: "ar"` while still looking at English copy.
- Saving calls the same `/api/admin/cms/batch` endpoint the old editor used — the `SiteContent`
  data model, the public `/api/site-content` read path, and `useSiteContent()`'s DB-first/
  translations-fallback behavior are all unchanged. Only the editing UI and which fields are
  reachable changed.

**Why the rebuild happened**: the old editor was a hardcoded ~150-field `SECTIONS[]` array in
`admin/cms/page.tsx` that had to be manually kept in sync with every section component — it had
drifted in several concrete, confirmed ways before the rebuild: 3 whole CMS sections
(`trainingDetail`, `coachingDetail`, `experience`) edited content for components that were never
rendered on the homepage at all; the `footer` section had no editor UI despite the footer reading
from the same CMS system; `faq`'s badge/title/subtitle were rendered as bare hardcoded strings
that bypassed `get()` entirely, so editing them did nothing; and the CMS pricing fields
(`offer1_price`/`offer2_price`) were free text fully independent of `Product.price`, so an admin
editing one had no effect on the other (see "Pricing" below — this one is now structurally fixed,
not just documented). Because the new editor **is** the real homepage, a component not rendered on
the page simply can't appear in the editor either — that whole class of drift is no longer
possible by construction, not just by discipline.

Media note: `/admin/media` (protected `MediaAsset` uploads, `isProtected: true` by default,served via the entitlement-gated `/api/media/[id]`) is for files that require a logged-in,
entitled customer — the split PDF, exercise media. It is **not** for homepage images: an
`EditableImage` upload goes through `/api/admin/cms/upload` instead, which stores the file
unauthenticated in `public/uploads/` so anonymous visitors can actually see it. Pasting a
protected media-library asset's id into a public-facing image field was a real, confirmed way to
end up with a broken image for every logged-out visitor — the Site Editor's image overlay only
ever uses the public upload path, so this can't happen through it anymore.

---

## Data model (`prisma/schema.prisma`)

`User` (role: `ADMIN`|`CUSTOMER`, nullable `passwordHash` — a "shell" user can exist before ever
setting a password), `Product` (`type`: `TRAINING_PLAN`|`PERSONAL_COACHING`, `price` in piastres
— the single source of truth for pricing everywhere), `Order` (`paymentMethod`: `INSTAPAY`|
`PAYPAL`|`TELDA`, `status`: `PENDING`|`AWAITING_CONFIRMATION`|`CONFIRMED`|`FAILED`|`REFUNDED`,
`gatewayRef`/`gatewayData` populated by the PayPal webhook), `Entitlement` (the real
access-control row: userId + productId + status + optional `expiresAt`), `TrainingProgram`/
`TrainingDay`/`Exercise` (real, admin-authored, not currently customer-facing), `MediaAsset`
(local-disk-backed uploads, also used for the split PDF file itself — see below), `SiteContent`/
`SiteRevision` (CMS), `Setting` (key-value; see `src/lib/settings-defaults.ts` for the known keys
and defaults).

No `CheckIn`, `Payment`, `TrainingPlan`, or `CoachingEnrollment` models exist — older docs
described a schema that was never built. Don't recreate these; check-ins/nutrition tracking are
explicitly out of scope (WhatsApp-only).

---

## Payment / order state machine

- **InstaPay**: `PENDING` → `AWAITING_CONFIRMATION` (order creation sends
  `sendOrderConfirmationEmail` asking for a WhatsApp payment screenshot) → admin manually reviews
  and confirms in `/admin/orders` → `CONFIRMED`, `User`+`Entitlement` created then,
  `sendAccessGrantedEmail` sent.
- **Telda**: identical manual path to InstaPay (previously auto-confirmed instantly with zero
  verification — fixed).
- **PayPal**: `POST /api/orders` creates the order `PENDING` and calls `createPayPalOrder()`
  (`src/lib/paypal.ts`, charges in EUR since PayPal doesn't settle EGP — 19€/119€, matching the
  site's advertised conversion) to get an approval URL; the checkout page redirects the browser
  there. On return, `/checkout/return` calls `POST /api/paypal/capture` with the PayPal order
  token to actually capture the payment, then polls `GET /api/orders?orderRef=` for the webhook
  (`/api/webhooks/paypal`) to flip the order to `CONFIRMED` and create `User`+`Entitlement`. If
  PayPal isn't configured (`PAYPAL_CLIENT_ID`/`SECRET` unset), `/api/orders` returns a 503 rather
  than silently failing. **Requires a PayPal Business account** (the user currently has a personal
  account) — code is ready, needs real credentials + a configured webhook subscription to go live;
  buildable/testable against PayPal sandbox in the meantime.
- **Paymob**: out of scope, not pursued (no merchant account, user wants to avoid the Egyptian
  KYC/paperwork). The webhook code exists but nothing triggers it.

---

## The PDF pipeline (the actual product) — anti-piracy design

`PdfCanvas.tsx` renders the plan with `pdfjs-dist`, one `<canvas>` per page, fetching raw bytes
from `GET /api/split`.

- **Access control**: `/api/split` requires an authenticated customer (`requireCustomer()`) with
  an active, non-expired `Entitlement` on either product type (coaching entitles you to the plan
  too) — enforced both in the route itself and via the `/api/split/:path*` middleware matcher.
  This was previously **completely unauthenticated** — the single highest-priority fix in this
  codebase, since it made every client-side anti-copy measure below moot.
- **File storage**: the PDF is a `MediaAsset` (reusing the existing media-library infrastructure)
  once an admin uploads one via the "Training Plan File" section in `/admin/settings`; the active
  file is tracked by the `active_split_media_id` Setting. Falls back to the original hand-placed
  `private-assets/AMARX-SPLIT.pdf` if no upload has happened yet. Neither path is git-tracked
  (`.gitignore` excludes `private-assets/` and `private_media/`) — existing git history still has
  old copies, but nothing new gets committed.
- **Offline support**: `PdfCanvas.tsx` caches the PDF bytes in IndexedDB (`amar-split-cache` DB)
  after a successful authenticated fetch, and checks a lightweight `GET /api/split/version`
  marker on every load to detect a newly-uploaded file and re-fetch — this is the mechanism that
  picks up admin updates, not a live push (an already-open tab won't refresh instantly; the next
  normal load will). `public/sw.js` handles app-shell caching for `/app*` only — it deliberately
  does **not** cache `/api/split` itself, since a Service Worker intercepts fetches ahead of the
  page's own `cache` options, and a cache-first SW response there would silently bypass the
  auth/entitlement check on every request after the first.
- **Watermarking**: every rendered page gets a semi-transparent, diagonally-repeating watermark of
  the viewing customer's email (drawn client-side from the live session onto the canvas right
  after `pdf.js` renders it, in `renderPage()` — see `drawWatermark()`). This is deliberately not
  baked into a stored file, so it can't be captured once and stripped for reuse. This is the
  realistic deterrent for leaks — the existing keyboard/print/right-click blocking in
  `app/layout.tsx` and `PdfCanvas.tsx` is a reasonable baseline against casual copying, but cannot
  stop a photo of the screen, especially on mobile.
- **Orphaned day/exercise browser removed**: `my-split/[dayId]/page.tsx` and its supporting
  `/api/customer/training/**` + `/api/customer/entitlements/program` routes were deleted — they
  were real and DB-driven but unreachable from any UI, and duplicated the static-PDF delivery
  path with fake "Dev Preview" fallback content. The admin Programs/Exercises builder backend
  stays as-is in case it's revisited later.

---

## Settings as the real source of truth

`src/lib/settings-defaults.ts` holds the known keys + defaults (pure constants, safe to import
from client components). `src/lib/settings.ts` adds the DB-backed reads (`getSetting`,
`getSettings`, `getPublicSettings`), cached via Redis (`fetchWithCache`, 5 min TTL, invalidated on
every admin write). **Keep these two files' import boundaries intact** — `settings.ts` pulls in
`@/lib/db` and `@/lib/redis` (Node-only, breaks the browser bundle if imported from a client
component; this happened once already and was fixed by splitting the files).

- Server code (API routes, `email.ts`) calls `getSetting()`/`getSettings()` directly.
- Client components use `useSettings()` (`src/lib/use-settings.ts`, mirrors the existing
  `useSiteContent()` pattern) which fetches `/api/settings/public` once and caches at module
  level.

WhatsApp number and InstaPay/PayPal/Telda payment handles are now read live from this system
across checkout pages, the login page, the portal, and transactional emails — previously
hardcoded in ~14 places. Instagram/YouTube links were already CMS-driven (a different but
equally-real admin-editable mechanism) and weren't touched. `site_name` (the "THE AMAR" brand
string) is still hardcoded in various places — low-value to chase further right now.

---

## Pricing — single source of truth

`Product.price` (piastres, in Postgres) is the only real price, edited only from
`/admin/products`. The public `GET /api/products` endpoint returns it; `checkout/split/page.tsx`,
`checkout/coaching/page.tsx`, **and now `two-paths.tsx`'s homepage pricing cards** all fetch it
(by product `slug`: `training-split`, `personal-coaching`) and display/charge exactly that number.
The CMS no longer has editable `offer1_price`/`offer2_price` text fields at all — that was the
previous drift vector (a free-text CMS field with no connection to what checkout actually
charged) and it's now closed structurally rather than merely documented: the price number on the
homepage literally cannot diverge from `Product.price` because there's nowhere else to type a
different one. Everything else around the price (badge, subtitle, feature bullets, button text)
is still CMS-editable as normal. The old "-40% OFF" discount framing (a different displayed price
than what was actually charged) was removed for this reason; the scarcity/spots-remaining UI was
kept but reworded to not claim a discount that no longer exists. `src/app/checkout/page.tsx` (a
third, broken checkout page with a stale product slug) was deleted; its one inbound link
(`coaching-detail.tsx`) now points to `/checkout/coaching`.

---

## Conventions

- **i18n**: `src/lib/translations.ts` is the single source of truth for `en`/`ar` strings. Always
  update both languages together. Don't hardcode user-facing strings in JSX.
- Run `npx tsc --noEmit` (and ideally `npm run build`) before considering a change finished.
- Prices come from `Product.price`; contact/payment info comes from the `Setting` table via
  `getSetting()`/`useSettings()`. Don't reintroduce hardcoded copies of either.
- **Client/server import boundaries matter**: anything importing `@/lib/db` or `@/lib/redis`
  (directly or transitively) breaks if pulled into a `"use client"` component's bundle. When
  adding a client-usable version of server-backed data, split pure constants into their own file
  (see `settings-defaults.ts` vs `settings.ts`) rather than importing the server module directly.
- UI: background `#07090e`/`#0b0f19`, accent electric blue (`rgba(59,130,246,...)`), `Alexandria`
  (Arabic) / `Outfit`/`Inter` (English) fonts, `@/` path alias.

---

## Known gaps / in-progress (keep this current)

- **PayPal needs a real Business account** to go live — code is complete and ready (order
  creation, capture, webhook, return-page polling), but `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/
  `PAYPAL_WEBHOOK_ID` need real values from a PayPal Business account (the user has a personal
  account today). Testable against PayPal sandbox credentials in the meantime.
- **Paymob webhook is dead code** — fully built and signature-verified, but nothing creates a
  Paymob payment session and there's no merchant account. Not being pursued (user's choice — no
  Egyptian KYC/paperwork). Candidate for deletion later if never revisited.
- **`site_name` branding string** still hardcoded in a handful of places rather than read from
  `Setting` — low priority, rarely changes.
- **Renewal price mismatch**: `translations.ts`'s coaching "renewal" copy still says "1,999 EGP /
  99 €" while CLAUDE.md historically claimed 999 LE — this wasn't part of the confirmed 499/2,499
  price reconciliation (only the two main offer prices were confirmed with the user) and needs a
  real number before it's trustworthy. This one field (`pricing.offer2_renewal`) is still free
  CMS text (unlike the main offer prices, a "renewal" isn't tied to a `Product` row), so it's
  editable directly in the Site Editor once a real number is confirmed.
- **No live push when the admin uploads a new PDF** — already-open tabs pick up the change on
  their next natural reload (via the `/api/split/version` check), not instantly. Real-time push
  would need Web Push/WebSocket infrastructure this app doesn't have; judged disproportionate for
  now.
- **Media storage is local disk** (`private_media/`) — verify this survives the actual deployment
  target's filesystem lifecycle (ephemeral serverless hosts lose local files on redeploy). Note
  this also now applies to `public/uploads/` (the Site Editor's public image uploads), which has
  the same local-disk lifecycle risk.
- **`TrainingProgram`/`TrainingDay`/`Exercise` admin builder (`/admin/programs`) has no consumer**
  — real, working CRUD, but nothing in the customer portal reads it; customers only ever get the
  static PDF via `/app/my-split`. Left as-is (admin-only backend, harmless if unused) — a decision
  on whether to delete it or eventually build a real per-exercise portal view is still open and
  deliberately not made as part of the CMS rebuild.
