# PawFlo — Security

> Last updated: May 2026 | Maintainer: @cesarz  
> Threat model: OWASP Mobile Top 10 + RODO/GDPR

---

## Threat Model

| Asset | Threat | Mitigation |
|---|---|---|
| User passwords | Brute force, DB breach | Argon2id (19 MB, 2 iter) — bcrypt rejected |
| Access tokens | Theft via network/memory | 15-min expiry, HTTPS only, Keychain storage |
| Refresh tokens | Theft → permanent session | Rotation on every use, hashed in DB |
| PII (phone, chip) | DB breach | AES-256-GCM encryption at rest |
| Auth endpoint | Credential stuffing | Rate limit: 5 req / 15 min / IP |
| Email enumeration | Register/login probing | Both endpoints always return same status |
| Location data | Tracking | Explicit `locationConsent` flag, not stored without consent |
| Push tokens | Token harvest | Validated format, overwritten on re-login |

---

## Password Security

**Algorithm:** Argon2id — winner of Password Hashing Competition 2015

```ts
// apps/api/src/lib/crypto.ts
const ARGON_OPTIONS = {
  memoryCost: 19456,  // 19 MB — OWASP recommended minimum
  timeCost:   2,      // 2 iterations
  parallelism: 1,
};
```

**Rejected alternatives:**
- bcrypt — no memory-hardness (GPU-crackable at scale)
- scrypt — similar to Argon2 but less audited
- SHA-256/MD5 — never for passwords

**Timing attack protection:** Login always runs `hashPassword` even for unknown emails (constant-time response regardless of whether email exists).

---

## JWT Architecture

```
Access Token
  payload: { sub: userId, type: 'access', iat, exp }
  secret:  JWT_ACCESS_SECRET (min 32 chars)
  expiry:  15 minutes
  stored:  in-memory only (mobile: Keychain/Keystore via expo-secure-store)

Refresh Token
  payload: { sub: userId, type: 'refresh', jti: randomHex(8), iat, exp }
  secret:  JWT_REFRESH_SECRET (min 32 chars, different from access)
  expiry:  7 days
  stored:  SHA-256 hash in DB only — raw JWT never persisted
           expo-secure-store on mobile (Keychain iOS / Keystore Android)
```

**`jti` field:** Prevents unique-constraint collisions when login + refresh happen within the same second (same `iat` → identical JWT without `jti`). Also a security improvement for token family tracking.

**Token rotation:** Every `/auth/refresh` call:
1. Verifies JWT signature
2. Looks up hash in DB, checks `revokedAt IS NULL`
3. Marks old token as revoked (`revokedAt = now()`)
4. Issues new access + refresh token pair

**Refresh token reuse detection:** If a revoked token is presented, it returns 401. (Full family revocation — revoking all tokens for that user — can be added in Phase 2.)

**Storage:**
- Mobile: `expo-secure-store` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` — never AsyncStorage
- Web: HttpOnly cookie (not yet implemented — Phase 2)

---

## Data Encryption at Rest

Sensitive fields encrypted with **AES-256-GCM** before database insert:

| Field | Model | Reason |
|---|---|---|
| `phoneEncrypted` | User | RODO special category |
| `chipNumberEncrypted` | Dog | Unique identifier |

```ts
// packages/utils/src/crypto.ts
// Key: ENCRYPTION_KEY env var (32 bytes hex = 64 chars)
// Each encryption: random 12-byte IV prepended to ciphertext
// Format stored in DB: "iv_hex:ciphertext_hex"
```

Fields NOT encrypted (query-indexed, low sensitivity): email, name, city, plan, timestamps.

---

## API Security

### Rate Limiting

```
Auth endpoints:  5 requests / 15 minutes / IP
Key:             sha256(ip + IP_SALT).slice(0,16)
```

IP is hashed before use in rate limit key and audit log — raw IP never stored.

### Anti-Enumeration

Both `/auth/register` and `/auth/forgot-password` return `200`/`201` regardless of whether the email exists. Login uses timing-protection (always runs Argon2, even for unknown emails).

### CORS

Strict whitelist — only own domains. Configured in Fastify via `@fastify/cors`.

### Security Headers (web)

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self' ...
Referrer-Policy: strict-origin-when-cross-origin
```

### Input Validation

All inputs validated with Zod (`@pawflo/validation`) on **both** frontend and backend. Backend validation is authoritative — frontend validation is UX only.

---

## RODO / GDPR Compliance

| Requirement | Implementation |
|---|---|
| Explicit consent | `consentTerms` + `consentPrivacy` DateTime on User |
| Marketing opt-in | `consentMarketing` DateTime (nullable) |
| Right to erasure | `User.deletedAt` soft delete, 30-day window, then hard delete via cron |
| Data portability | `GET /api/users/me/export` — full JSON export, logged in AuditLog |
| Data minimisation | Location only stored with `locationConsent: true` |
| Breach notification | Sentry alerts (see Incident Response below) |

**Audit trail:** Every sensitive action logged in `AuditLog` (REGISTER, LOGIN, LOGOUT, PASSWORD_CHANGE, ACCOUNT_DELETE, DATA_EXPORT) with hashed IP.

---

## Biometric Authentication

- Flag stored in Keychain: `pawflo_biometric_enabled` (Keychain, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`)
- Biometric challenge on every session restore (app startup) when flag is set
- Enable requires biometric confirmation at toggle time
- Disable clears the flag — no re-authentication required
- Biometric never replaces password — it gates the already-stored refresh token

---

## Incident Response

### Severity Levels

| Level | Example | Response Time |
|---|---|---|
| P0 — Critical | Auth bypass, data breach, DB down | 30 min |
| P1 — High | Elevated error rate, push failures >10% | 2 hours |
| P2 — Medium | Single user data issue, email delivery fail | 24 hours |
| P3 — Low | Cosmetic bug, analytics gap | Next sprint |

### P0 Playbook

1. **Contain** — Revoke all active refresh tokens: `UPDATE "RefreshToken" SET "revokedAt" = now() WHERE "revokedAt" IS NULL`
2. **Assess** — Check Sentry, DB audit logs, API access logs
3. **Communicate** — If PII exposed: notify affected users within 72h (RODO Art. 33)
4. **Patch** — Deploy fix via EAS Update (JS-only) or EAS Build (native change)
5. **Post-mortem** — Document in `docs/ADR/` within 5 days

### Environment Variables (required)

```
JWT_ACCESS_SECRET     min 32 chars, random
JWT_REFRESH_SECRET    min 32 chars, different from access
ENCRYPTION_KEY        64 hex chars (32 bytes)
IP_SALT               16+ chars, random
DATABASE_URL          PostgreSQL connection string
DIRECT_URL            Direct connection (Prisma, bypasses pooler)
RESEND_API_KEY        Email delivery
SENTRY_DSN            Error tracking
```

**Never commit secrets.** Use `.env` (gitignored) locally, CI secrets or Vault in production.

### Secret Rotation

Rotating `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` instantly invalidates all active tokens — all users must re-login. Acceptable for security incidents, plan a maintenance window for routine rotation.
