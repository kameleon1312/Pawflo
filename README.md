# PawFlow

Polish dog community + matchmaking application.

> "Każdy pies zasługuje na świetne życie."

## Documentation

- 📘 [Master instruction](./PAWFLOW_INSTRUKCJA_AGENTA_VSC.md)
- 🤖 [Claude Code rules](./CLAUDE.md)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md) — coming soon
- 🔒 [Security](./docs/SECURITY.md) — coming soon

## Quick start

```bash
pnpm install
pnpm dev:api      # Backend on :3001
pnpm dev:web      # Landing on :3000
pnpm dev:mobile   # Expo dev server
```

## Project structure

- `apps/mobile` — Expo + React Native (primary product)
- `apps/web` — Next.js 14 (landing page)
- `apps/api` — Fastify + Prisma + PostgreSQL
- `packages/*` — shared theme, types, validation, utilities

## Status

🚧 **MVP development** (Phase 1 — April-July 2026)
