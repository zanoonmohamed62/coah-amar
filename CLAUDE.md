# CLAUDE.md — Coach Amar Web Platform

## ⚡ Zero-Scan Rule (Strict Token Efficiency)
- **DO NOT scan, list, or read arbitrary project files** at session start.
- All core architecture, file locations, schemas, and flows are documented in this file.
- When editing, read **ONLY** the specific target file and lines using line-range slicing.

---

## 🏗️ Project Overview & Tech Stack
- **Brand**: THE AMMAR ("X SPLIT" / "BUILD DIFFERENT" / X "MÉTHODE").
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (Strict mode).
- **Styling**: Tailwind CSS v4 + Vanilla CSS custom variables (`src/app/globals.css`).
- **Animations**: Framer Motion (`framer-motion`).
- **Icons**: Lucide React (`lucide-react`).
- **Database / ORM**: PostgreSQL (via Supabase) with Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`).
- **Auth**: NextAuth v5 Beta (`next-auth`, JWT strategy, Credentials provider).
- **Email**: Resend API (`resend`).
- **Git Remote**: `git@github.com:zanoonmohamed62/coah-amar.git` (SSH authenticated).

---

## 📁 Repository Structure Map

```text
amar-site/
├── assets/                          # Original uploaded raw assets
├── prisma/
│   ├── schema.prisma                # PostgreSQL models (User, Order, Plan, CheckIn, etc.)
│   └── seed.ts                      # DB seeder script
├── public/
│   └── assets/                      # Static web assets
│       ├── coach-header-new.jpg     # Hero section header image
│       ├── coach-about-new.jpg      # About Coach section image
│       ├── training-dashboard.png   # Training plan visual
│       └── coaching-dashboard.png   # 1-on-1 coaching visual
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with LanguageProvider & fonts
│   │   ├── page.tsx                 # Landing page (combines all section components)
│   │   ├── globals.css              # Theme tokens, dark palette (#07090e), utility classes
│   │   ├── checkout/page.tsx        # Order registration & WhatsApp redirection flow
│   │   ├── login/page.tsx           # Authentication login page
│   │   ├── app/                     # Client Portal (/app/training, /app/nutrition, /app/checkins)
│   │   ├── admin/                   # Admin Portal (/admin/orders, /admin/clients, /admin/cms, /admin/settings)
│   │   └── api/
│   │       ├── auth/                # NextAuth route handlers
│   │       ├── orders/              # Order submission & status APIs
│   │       ├── checkout/            # Checkout webhook / processing
│   │       └── admin/               # Admin endpoints (products, users, payments, programs)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx           # Global responsive navigation + Lang switcher
│   │   │   └── footer.tsx           # Global footer with WhatsApp & Instagram links
│   │   ├── sections/                # Landing page modular sections:
│   │   │   ├── hero.tsx             # Hero section (THE AMMAR, "X SPLIT", Let's Talk CTA)
│   │   │   ├── trust-strip.tsx      # Values ticker (Personalized, Scientific, etc.)
│   │   │   ├── problem.tsx          # Generic PDF vs Custom System comparison
│   │   │   ├── two-paths.tsx        # Offer 1 (Plan 399 LE/19€) vs Offer 2 (Coaching 1,399 LE/79€)
│   │   │   ├── training-plan-detail.tsx # Deep-dive into Training Plan
│   │   │   ├── coaching-detail.tsx  # Deep-dive into 3-month coaching pillars
│   │   │   ├── how-it-works.tsx     # 3-step vs 6-step workflow
│   │   │   ├── coach.tsx            # About Coach Amar + Instagram CTA
│   │   │   ├── coaching-experience.tsx # 12-week progression timeline
│   │   │   ├── testimonials.tsx     # Client transformation reviews
│   │   │   ├── faq.tsx              # Comprehensive FAQ accordion
│   │   │   └── final-cta.tsx        # Bottom conversion call-to-action
│   │   └── dashboard/               # Reusable dashboard UI (Sidebar, cards, tables)
│   └── lib/
│       ├── translations.ts          # Single source of truth for EN and AR dictionaries
│       ├── language-context.tsx     # React Context for language (en / ar) and direction (ltr / rtl)
│       ├── prisma.ts                # PrismaClient singleton instance
│       ├── auth.ts                  # NextAuth handlers and session utilities
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
1. **Training Plan (Offer 01)**:
   - Price: `399 LE / 19 €` (`٣٩٩ ج.م / 19 €`)
   - Type: One-time payment, instant digital delivery.
2. **Personal Coaching (Offer 02 - 3 Months)**:
   - Price: `1,399 LE / 79 €` (`١,٣٩٩ ج.م / 79 €`)
   - Type: 3 months complete coaching, custom nutrition, training & weekly check-ins.
3. **Coaching Renewal**:
   - Price: `999 LE / 69 €` (`٩٩٩ ج.م / 69 €`) per 3 months.

---

## 📱 External Integrations
- **WhatsApp**: `https://wa.me/34610354255`
- **Instagram**: `https://www.instagram.com/amar.el.7ewety/`
- **InstaPay**: `amar.fitness@instapay`
- **Vodafone Cash**: `01026048106`

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

# Push code to GitHub (SSH authenticated)
git push origin main
```
