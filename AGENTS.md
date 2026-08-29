# AGENTS.md — AI Agent Guidance & Project Reference

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Where to look

This file intentionally does not duplicate architecture details, since duplicated docs are what
drifted out of sync last time. See:
- **`CLAUDE.md`** — tech stack, repo layout, commands.
- **`ENGINEERING.md`** — routes, database schema, auth model, payment state machine, and a
  "Known gaps / in-progress" section tracking what's mid-flight.

Both files are maintained but can lag reality. Verify specifics against source (grep/read the
actual files) before a change that depends on exact current behavior — don't assume either file
is exhaustive or perfectly current.
