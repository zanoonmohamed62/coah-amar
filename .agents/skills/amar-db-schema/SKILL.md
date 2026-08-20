---
name: amar-db-schema
description: Quick reference for Prisma schema, PostgreSQL models, and database migration commands.
---

# THE AMMAR Platform — Database Schema Skill

## 1. Key Models Reference
- `User`: Roles (`ADMIN`, `CLIENT`). Contains client profile and credentials.
- `Order`: Represents training plan or coaching purchases, stores prices, currency (`LE`, `EUR`), status (`PENDING`, `CONFIRMED`, `CANCELLED`).
- `Payment`: Transaction logs (Vodafone Cash, InstaPay, Card).
- `TrainingPlan` & `PlanDay` & `Exercise`: Push/Pull/Legs and customized training programs.
- `CoachingEnrollment` & `CheckIn`: 3-month coaching follow-up and weekly progress photos/metrics.
- `Setting`: Global platform settings, payment numbers, and CMS flags.

## 2. Common Prisma Commands
- `npx prisma db push` — Push schema updates directly to PostgreSQL.
- `npx prisma generate` — Regenerate Prisma client.
- `npx prisma studio` — Open Prisma GUI at `localhost:5555`.
- `npm run db:seed` — Seed default data.
