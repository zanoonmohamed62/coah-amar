# Project Rules — THE AMMAR Fitness Platform

## 1. Anti-Scan & Zero-File-Exploration Policy
- Never run generic file searches, directory listings, or whole-file views at startup.
- Always consult `AGENTS.md` or `CLAUDE.md` for architecture, file locations, and schema details.
- Read only specific line ranges in specific targeted files.

## 2. i18n & Content Modification
- Never hardcode text strings into React components.
- Any text or price update must be applied to `src/lib/translations.ts` under both `en` and `ar`.

## 3. UI/UX Consistency
- Background primary color: `#07090e` / `#0b0f19`.
- Accent color: Electric Blue (`rgba(59, 130, 246, ...)`).
- Fonts: `Alexandria` for Arabic, `Outfit` / `Inter` for English.
- Maintain RTL / LTR layout symmetry with Tailwind `rtl:` and `dir` attributes.

## 4. Code Quality & Build Verification
- Always test TypeScript compilation with `npx tsc --noEmit` before concluding any multi-file changes.
- Ensure all imports use the `@/` path alias.
