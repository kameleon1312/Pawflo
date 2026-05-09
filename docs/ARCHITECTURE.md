# PawFlo — Architecture

> Last updated: May 2026 | Maintainer: @cesarz

---

## Overview

PawFlo is a **pnpm monorepo** with three applications sharing common packages:

```
pawflo/
├── apps/
│   ├── mobile/    — Expo 54 + React Native (primary product)
│   ├── web/       — Next.js 14 App Router (landing + blog)
│   └── api/       — Fastify 4 + Prisma + PostgreSQL (backend)
├── packages/
│   ├── theme/     — Design tokens (single source of truth)
│   ├── types/     — Shared TypeScript interfaces
│   ├── validation/ — Zod schemas (shared frontend ↔ backend)
│   ├── api-client/ — Typed HTTP client (mobile + web)
│   └── utils/     — Pure helpers (date, crypto, format)
└── docs/          — ADR, security, design system
```

---

## Auth Flow

```
Mobile                          API
  │                              │
  │──── POST /auth/login ────────▶│
  │                              │ Argon2id verify
  │◀─── { accessToken (15m),     │
  │       refreshToken (7d) } ───│
  │                              │
  │  Store both in Keychain/     │
  │  Keystore via expo-secure-store │
  │                              │
  │  [15 min pass]               │
  │──── any request (401) ───────▶│
  │──── POST /auth/refresh ──────▶│
  │                              │ Revoke old token
  │◀─── { new accessToken,       │ Issue new token
  │       new refreshToken } ────│ (rotation every use)
  │                              │
  │  [refresh token expired]     │
  │  Clear tokens, redirect to   │
  │  login screen                │
```

**Key decisions:**
- Refresh tokens are stored in DB as SHA-256 hashes — raw JWT never persisted
- Each refresh token is single-use (rotation on every call)
- `jti` (JWT ID) = `crypto.randomBytes(8).hex` prevents duplicate tokens issued within the same second
- Parallel 401 responses share one refresh call (`_refreshPromise` singleton in api-client)

---

## Push Notification Flow

```
Mobile                     API                    Expo Push API
  │                          │                          │
  │  registerForPushNotifications()                      │
  │──── POST /users/push-token ──▶│                     │
  │                          │ store ExponentPushToken[…] │
  │                          │                          │
  │  [User B swipes LIKE → match]                       │
  │                          │──── POST /push/send ────▶│
  │                          │                          │──── FCM ──▶ Android
  │                          │                          │──── APNs ──▶ iOS
  │◀─────────────────── push notification ──────────────│
```

- Push token registered on login AND on every session restore
- Sends only to the OTHER user (swipee's owner gets the match push; sender already has `matched:true` in response)
- Fire-and-forget: push failure never blocks the API response
- Token format validated: must match `/^ExponentPushToken\[.+\]$/`

---

## Database Schema (key models)

```
User
 ├── dogs[]          → Dog (1:many, ownerId)
 ├── refreshTokens[] → RefreshToken (hashed, rotated)
 └── auditLogs[]     → AuditLog (REGISTER/LOGIN/LOGOUT/…)

Dog
 ├── photos[]        → Photo
 ├── swipesGiven[]   → Swipe (as Swiper)
 ├── swipesReceived[] → Swipe (as Swipee)
 ├── vaccinations[]  → Vaccination
 ├── visits[]        → VetVisit
 ├── medications[]   → Medication
 ├── allergies[]     → Allergy
 └── weightHistory[] → WeightEntry

Swipe (swiperId, swipeeId, direction: LIKE|PASS)
 └── @@unique([swiperId, swipeeId])   ← upsert-safe

Match (dogAId, dogBId — sorted to guarantee order)
 ├── messages[]      → Message
 └── @@unique([dogAId, dogBId])

Place (VET|SHOP|GROOMER — PawMap)
 └── @@unique([name, city])           ← idempotent seed
```

**Encryption:** `phoneEncrypted`, `chipNumberEncrypted` → AES-256-GCM via `@pawflo/utils`  
**Soft delete:** `User.deletedAt`, `Dog.deletedAt` — 30-day RODO window

---

## API Routes

| Prefix | Plugin | Auth |
|---|---|---|
| `/api/auth` | authRoutes | Public (rate-limited: 5/15min/IP) |
| `/api/users` | userRoutes | Bearer JWT |
| `/api/dogs` | dogRoutes | Bearer JWT |
| `/api/swipes` | swipeRoutes | Bearer JWT |
| `/api/matches` | matchRoutes | Bearer JWT |
| `/api/health` | healthRoutes | Bearer JWT |
| `/api/places` | placeRoutes | Public |

**Real-time:** Socket.io on the same Fastify server, rooms = `match:{matchId}`

---

## ADR — Architecture Decision Records

### ADR-001: pnpm workspaces without Turborepo
- **Decision:** pnpm workspaces only
- **Reason:** 2 apps don't justify Turborepo overhead (+200 MB cache, learning curve). Can migrate in Phase 2 when team grows beyond 3.

### ADR-002: Fastify over Express
- **Decision:** Fastify 4
- **Reason:** 2× faster JSON serialization, built-in schema validation, first-class TypeScript, Prisma plugin ecosystem.

### ADR-003: Expo managed workflow
- **Decision:** Expo SDK 54 (managed)
- **Reason:** Single codebase for iOS + Android, OTA updates without store approval for JS changes, Expo Push API abstracts FCM/APNs, EAS Build for distribution.

### ADR-004: prisma db push over migrate dev
- **Decision:** `prisma db push` in development
- **Reason:** Supabase/managed PostgreSQL with RLS prevents `migrate dev` from creating a shadow database. `db push` bypasses shadow DB. Production migrations done manually with `migrate deploy`.

### ADR-005: Expo Push API over direct FCM/APNs
- **Decision:** Route all pushes through `exp.host/--/api/v2/push/send`
- **Reason:** Single endpoint handles both platforms, no Firebase project required for development, tokens are stable across app updates.

### ADR-006: React Native Reanimated 3 over Animated API
- **Decision:** Reanimated 3 + Gesture Handler for SwipeCard
- **Reason:** Animated API uses JS thread (drops frames during heavy JS work). Reanimated 3 runs animations on the UI thread natively — guaranteed 60fps swipe even during API calls.

### ADR-007: Zod shared between frontend and backend
- **Decision:** `@pawflo/validation` package with Zod schemas used on both sides
- **Reason:** Single source of truth for validation rules. Prevents drift between frontend error messages and backend rejection. Type inference flows from Zod to TypeScript automatically.
