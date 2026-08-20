---
name: amar-dev-workflow
description: Workflow cheat sheet for developing, verifying, and deploying the THE AMMAR platform.
---

# THE AMMAR Platform — Developer Workflow Skill

## 1. Fast Development Cycle
- **Dev Server**: Run `npm run dev` in background.
- **Type Checking**: Run `npx tsc --noEmit` to verify type safety.
- **Linting**: Run `npm run lint`.

## 2. Git & Deployment Process
1. Test TypeScript: `npx tsc --noEmit`.
2. Stage and commit: `git add . && git commit -m "Your descriptive message"`.
3. Push to GitHub (SSH): `git push origin main`.
4. Vercel deploys automatically on every push to `main`.
