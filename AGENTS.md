# AGENTS.md — AI Agent Guidance & Project Reference

<!-- BEGIN:nextjs-agent-rules -->
This version of Next.js uses modern App Router conventions with React 19. All server actions, client components ("use client"), and route handlers follow Next.js 16 standards.
<!-- END:nextjs-agent-rules -->

## ⚡ Strict Anti-Scan & Token Optimization Rule
- **NEVER scan, list, or search through all project files at session startup.**
- All routes, components, database models, and translation keys are fully documented in this file.
- Use line-range reading (`StartLine`/`EndLine`) when inspecting or modifying files.

---

## 🧭 Repository Architecture & File Map

### 1. Application Routes (`src/app/`)
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `src/app/page.tsx` | Main landing page showcasing all sections |
| `/checkout` | `src/app/checkout/page.tsx` | Plan selector, customer data collection & WhatsApp direct order link |
| `/login` | `src/app/login/page.tsx` | Client & Admin login authentication |
| `/app` | `src/app/app/page.tsx` | Client dashboard (workouts, diet, check-ins) |
| `/admin` | `src/app/admin/page.tsx` | Admin control panel (orders, clients, CMS, settings) |
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth v5 authentication handlers |
| `/api/orders` | `src/app/api/orders/route.ts` | Order submission & retrieval |

### 2. UI Section Components (`src/components/sections/`)
| Section | File | Key Highlights |
|---------|------|----------------|
| **Hero** | `hero.tsx` | `THE AMMAR`, `“X SPLIT”`, `BUILD DIFFERENT`, Badge `X "MÉTHODE"`, Let's Talk CTA |
| **Trust Strip** | `trust-strip.tsx` | Horizontal values bar (Personalized, Data-driven, etc.) |
| **Problem** | `problem.tsx` | Generic PDF vs Living Coaching System comparison |
| **Two Paths** | `two-paths.tsx` | Offers cards: Training Plan (399 LE / 19 €) & Coaching (1,399 LE / 79 €) |
| **Training Detail** | `training-plan-detail.tsx` | Highlights of the DIY training split |
| **Coaching Detail** | `coaching-detail.tsx` | 4 pillars: Training, Nutrition, Supplements, Weekly Follow-Up |
| **How It Works** | `how-it-works.tsx` | Step-by-step roadmap for both offers |
| **Coach** | `coach.tsx` | Coach bio, portrait image, Instagram link |
| **Experience** | `coaching-experience.tsx` | 12-week progression timeline (Week 1, 4, 8, 12) |
| **Testimonials** | `testimonials.tsx` | Transformation results and quotes |
| **FAQ** | `faq.tsx` | Frequently Asked Questions accordion |
| **Final CTA** | `final-cta.tsx` | Bottom conversion block |

### 3. Core Libraries (`src/lib/`)
- `translations.ts`: Single source of truth for all English and Arabic strings.
- `language-context.tsx`: Provides `{ t, isArabic, lang, setLang, dir }` across client components.
- `prisma.ts`: Database client instance.
- `auth.ts`: Authentication configurations.
- `email.ts`: Transactional email dispatcher via Resend.

---

## 🗄️ Database Models (`prisma/schema.prisma`)
- `User`: `id, email, password, name, phone, role (ADMIN | CLIENT), createdAt`
- `Order`: `id, orderNumber, clientName, email, phone, planType, status, amount, currency, paymentMethod, notes`
- `Payment`: `id, orderId, method, transactionRef, amount, status`
- `TrainingPlan`: `id, title, description, level, days`
- `CoachingEnrollment`: `id, userId, startDate, endDate, status, renewalStatus`
- `CheckIn`: `id, enrollmentId, weekNumber, weight, photos, notes, coachFeedback, status`

---

## 🌐 Localization Guidelines
- When updating or adding any text, edit `src/lib/translations.ts`.
- Ensure changes are mirrored in both `translations.en` and `translations.ar`.
- Do NOT hardcode user-facing strings directly inside JSX components.

---

## ⚡ Development Commands
```bash
npm run dev          # Start development server
npx tsc --noEmit     # TypeScript compile check
npm run build        # Production build
npx prisma db push   # Sync Prisma schema to PostgreSQL
git push origin main # Deploy changes to GitHub & Vercel
```
