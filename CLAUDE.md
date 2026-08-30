# CLAUDE.md — Coach Amar Web Platform

For architecture, routes, database schema, auth model, and current in-progress work, see
**`ENGINEERING.md`** — this file covers stack, layout, and commands only. Both files are
maintained but can lag reality; verify specifics against source before a change depends on exact
behavior.

---

## 🏗️ Project Overview & Tech Stack
- **Brand**: THE AMAR — "Amar X Split" ("BUILD DIFFERENT" / X "MÉTHODE").
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (Strict mode).
- **Styling**: Tailwind CSS v4 + Vanilla CSS custom variables (`src/app/globals.css`).
- **Animations**: Framer Motion (`framer-motion`).
- **Icons**: Lucide React (`lucide-react`).
- **Database / ORM**: PostgreSQL with Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`).
- **Auth**: NextAuth v5 Beta (`next-auth`, JWT strategy, Google OAuth + Credentials providers).
- **Email**: Resend API (`resend`).

---

## 📁 Repository Structure Map

```text
amar-site/
├── prisma/
│   ├── schema.prisma                # PostgreSQL models — see ENGINEERING.md for the full list
│   └── seed.ts                      # DB seeder script
├── private-assets/                  # The plan PDF (gitignored, not tracked)
├── private_media/                   # Admin-uploaded media (gitignored, not tracked)
├── public/
│   ├── manifest.json, sw.js         # PWA manifest + service worker (real, see ENGINEERING.md)
│   └── assets/                      # Static web assets (images, icons)
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with LanguageProvider, PWA meta tags
│   │   ├── page.tsx                 # Landing page (combines all section components)
│   │   ├── globals.css              # Theme tokens, dark palette (#07090e), utility classes
│   │   ├── checkout/{split,coaching}/page.tsx  # The two live checkout funnels
│   │   ├── login/page.tsx           # Google OAuth + Credentials login
│   │   ├── app/                     # Customer portal (/app, /app/my-split, /app/account)
│   │   ├── admin/                   # Admin panel — see ENGINEERING.md for the full page list
│   │   └── api/                     # See ENGINEERING.md for the full route map
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx           # Global responsive navigation + Lang switcher
│   │   │   └── footer.tsx           # Global footer with WhatsApp & Instagram links
│   │   ├── sections/                # Landing page modular sections (hero, two-paths, faq, etc.)
│   │   ├── client/                  # Customer-portal client components (PdfCanvas, AppSidebar)
│   │   └── dashboard/               # Reusable dashboard UI (Sidebar, cards, tables)
│   └── lib/
│       ├── translations.ts          # Single source of truth for EN and AR dictionaries
│       ├── language-context.tsx     # React Context for language (en / ar) and direction (ltr / rtl)
│       ├── db.ts                    # PrismaClient singleton instance
│       ├── auth.ts / auth.config.ts # NextAuth handlers and session utilities
│       ├── auth-guard.ts            # requireAdmin / requireCustomer / requireAuth helpers
│       └── email.ts                 # Resend email notifications
```

---

## 🌐 Localization & i18n System
- **Source of Truth**: `src/lib/translations.ts`.
- **Languages**: English (`en` - LTR) and Arabic (`ar` - RTL).
- **Usage**:
  ```tsx
  import { useLanguage } from "@/lib/language-context";
  const { t, isArabic, lang, setLang, dir } = useLanguage();
  // Access: t.hero.titleLine1, t.twoPaths.offer1.price, etc.
  ```
- **Rule**: Whenever modifying text, labels, or prices, update **BOTH** `en` and `ar` in `src/lib/translations.ts`.

---

## 💰 Current Pricing & Offers

Prices live in `Product.price` in the database (piastres), edited only from `/admin/products`.
Every display of a price — both checkout pages and the homepage pricing cards — reads this same
value by product slug; there is no other place a price can be typed, so the two can't drift apart.
See `ENGINEERING.md`'s "Pricing" and "The CMS / Site Editor" sections for how this is wired.

1. **Training Plan (Offer 01)**: `499 LE`. One-time payment, lifetime access to the PDF.
2. **Personal Coaching (Offer 02 - 3 Months)**: `2,499 LE`. PDF + 3 months of WhatsApp coaching.

---

## 📱 External Integrations & Payments
- **WhatsApp**: `https://wa.me/34610354255`
- **Instagram**: `https://www.instagram.com/amar.el.7ewety/`
- **InstaPay**: `amar.fitness@instapay` (manual — customer sends a WhatsApp screenshot, admin confirms)
- **Telda**: `@amar.fitness` (manual, same flow as InstaPay)
- **PayPal**: `amar.fitness@paypal.me` (automated via webhook — see `ENGINEERING.md`)

These values above are just the current defaults for reference — the real, live values are read
from the `Setting` table everywhere (checkout pages, login, the portal, transactional emails, the
footer, and the coach section) via `getSetting()`/`useSettings()`, editable from `/admin/settings`.
Only `site_name` is still hardcoded in a few places — see `ENGINEERING.md`'s "Known gaps".

---

## 🎨 UI Conventions
- Background: `#07090e` / `#0b0f19`. Accent: electric blue (`rgba(59, 130, 246, ...)`).
- Fonts: `Alexandria` for Arabic, `Outfit`/`Inter` for English.
- Maintain RTL/LTR symmetry with Tailwind `rtl:` variants and the `dir` attribute.
- Use the `@/` path alias for imports.

---

## 🛠️ Commands Reference
```bash
# Run local dev server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build

# Push database schema changes
npx prisma db push

# Push code to GitHub
git push origin main
```
