# PawFlow — Master Instrukcja Wdrożeniowa dla Agenta AI w VS Code

> **Wersja 3.0** | Maj 2026
> Dokument wzorcowy dla agenta (Claude Code / Cursor / GitHub Copilot)
> Reżim wizualny: **Soulmate** (Tinder × Family-Friendly Tech)
> Priorytet bezpieczeństwa: **Maksymalny** (RODO, GDPR, OWASP)

---

## 📑 Spis treści

1. [Filozofia projektu](#1-filozofia-projektu)
2. [Architektura — monorepo lite](#2-architektura)
3. [Bezpieczeństwo danych — fundament](#3-bezpieczeństwo)
4. [Stack technologiczny](#4-stack)
5. [Design system — Tinder × Family Tech](#5-design-system)
6. [Struktura folderów](#6-struktura-folderów)
7. [Setup krok-po-kroku](#7-setup)
8. [Mobile-first — zasady](#8-mobile-first)
9. [Konwencje kodu](#9-konwencje)
10. [Workflow dla agenta](#10-workflow-agenta)
11. [Prompty gotowe do użycia](#11-prompty)
12. [Checklist deployment](#12-deployment)

---

## 1. Filozofia projektu

### 1.1 Misja

PawFlow to **pierwsza polska aplikacja, która łączy psy z okolicy** i daje właścicielom kompletny ekosystem cyfrowy: dopasowywanie, panel zdrowia, mapa usług, społeczność.

### 1.2 Architektura na poziomie biznesu

| Komponent | Cel | Priorytet |
|---|---|---|
| **Aplikacja mobilna** | Główny produkt, gdzie żyje user | 🔴 Krytyczny — 80% pracy |
| **Landing page** | Marketing, pre-rejestracja, info, cennik | 🟡 Ważny — 15% pracy |
| **Backend API** | Auth, dane, real-time, security | 🔴 Krytyczny — 5% pracy (proporcjonalnie więcej) |

**Reguła:** każda godzina pracy nad bezpieczeństwem = 10 godzin oszczędzonych później na incydencie.

### 1.3 Wartości produktowe

1. **Mobile-first** — ekran 375×812px to nasza święta szerokość
2. **Bezpieczeństwo by-design** — nie "dodamy później", ale od pierwszego commita
3. **Polski rynek** — UX, copy, integracje (Allegro, BLIK, weterynarze)
4. **Premium estetyka** — tylko App Store top 10 quality

---

## 2. Architektura — monorepo lite {#2-architektura}

### 2.1 Decyzja: pnpm workspaces (bez Turbo)

**Dlaczego nie polyrepo?**
- Trzy razy więcej work na każdą zmianę brand color
- Brak współdzielenia typów = bugs przy zmianie kontraktu API
- Twój agent w VS Code traci kontekst przy przełączaniu folderów

**Dlaczego nie pełny Turbo monorepo?**
- Twój projekt to 2 aplikacje, nie 10
- Turbo dodaje 200+ MB cache, configowanie, naukę
- Możesz dodać Turbo w fazie 2 (Q4 2026), kiedy zespół urośnie

**Wybór: pnpm workspaces** — minimalistyczny, działający, łatwo migrowalny.

### 2.2 Struktura wysokopoziomowa

```
pawflow/                          ← otwierasz w VS Code TEN folder
├── apps/
│   ├── mobile/                   ← Expo + React Native (główny produkt)
│   ├── web/                      ← Next.js 14 (landing + cennik + blog)
│   └── api/                      ← Fastify (Node.js backend)
│
├── packages/
│   ├── theme/                    ← Design tokens (single source of truth)
│   ├── types/                    ← TypeScript types (User, Dog, Match, etc.)
│   ├── validation/               ← Zod schemas (frontend + backend)
│   ├── api-client/               ← Typed API SDK (auto-generated)
│   └── utils/                    ← Date formatters, validators, helpers
│
├── tools/
│   ├── eslint-config/            ← Shared ESLint config
│   └── tsconfig/                 ← Shared TypeScript configs
│
├── docs/                         ← Architecture decisions, runbooks
│   ├── ADR/                      ← Architecture Decision Records
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/                ← CI/CD (GitHub Actions)
│
├── pnpm-workspace.yaml
├── package.json                  ← root package
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

### 2.3 Co gdzie należy

| Element | Lokalizacja | Dlaczego |
|---|---|---|
| Color tokens | `packages/theme/colors.ts` | Mobile + Web używają tego samego |
| `User` type | `packages/types/User.ts` | API zwraca, mobile/web konsumują |
| Email validator | `packages/validation/auth.ts` | Sprawdzane na froncie i backendzie |
| Login form | `apps/mobile/screens/LoginScreen.tsx` | Mobile-only UI |
| Marketing hero | `apps/web/app/(marketing)/page.tsx` | Web-only |
| `/api/auth/login` | `apps/api/routes/auth.ts` | Backend route |

---

## 3. Bezpieczeństwo danych — fundament {#3-bezpieczeństwo}

### 3.1 Kluczowe zasady — bez kompromisów

> **Reguła #0:** dane użytkownika to nie Twoje dane. Traktuj je jak depozyt, który możesz stracić.

### 3.2 Authentication & Authorization

**Hashing haseł:**
- ✅ **Argon2id** (rekomendowane przez OWASP 2024+)
- ❌ Nigdy nie używaj: MD5, SHA-1, plain bcrypt z domyślnymi parametrami
- Parametry: `memoryCost: 19456 KB, timeCost: 2, parallelism: 1`

```typescript
// apps/api/src/lib/crypto.ts
import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

**Tokeny sesji:**
- ✅ JWT z **krótkim czasem życia** (access token: 15 min, refresh token: 7 dni)
- ✅ Refresh tokeny **w bazie danych** (możliwość rewokacji)
- ✅ Rotacja refresh tokenów przy każdym użyciu
- ✅ Secret klucz minimum 256-bit, generowany z `openssl rand -base64 32`

```typescript
// apps/api/src/lib/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' }, ACCESS_SECRET, {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'pawflow.app',
    audience: 'pawflow-mobile',
  });
}
```

**Storage tokenów na mobile:**
- ✅ **expo-secure-store** (Keychain iOS / Keystore Android)
- ❌ Nigdy: `AsyncStorage`, `localStorage`, `SecureStore` na zwykłej appce React

```typescript
// apps/mobile/lib/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  async setTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync('access_token', access, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await SecureStore.setItemAsync('refresh_token', refresh, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async getAccessToken() {
    return SecureStore.getItemAsync('access_token');
  },
  async clear() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

### 3.3 Komunikacja klient ↔ serwer

- ✅ **TLS 1.3 only** (HTTPS wszędzie, certyfikaty Let's Encrypt + auto-renewal)
- ✅ **Certificate pinning** w aplikacji mobilnej (production)
- ✅ **HSTS header** na każdej odpowiedzi backendu (`max-age=31536000`)
- ✅ **CORS** ścisły whitelist tylko własnych domen
- ❌ Nigdy nie loguj tokenów, haseł, danych osobowych

```typescript
// apps/api/src/plugins/security.ts (Fastify plugin)
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

export async function registerSecurity(app: FastifyInstance) {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  });

  await app.register(cors, {
    origin: ['https://pawflow.pl', 'https://app.pawflow.pl'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  });
}
```

### 3.4 Dane wrażliwe — szyfrowanie

**At rest (baza danych):**
- ✅ PostgreSQL z **TDE (Transparent Data Encryption)** lub szyfrowanie woluminu
- ✅ Wrażliwe pola **dodatkowo szyfrowane na poziomie aplikacji** (AES-256-GCM):
  - Numery telefonów
  - Numery chip psa
  - Adresy domowe
  - Notatki medyczne

```typescript
// packages/utils/src/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

**In transit:** TLS 1.3, niczego więcej nie potrzebujesz.

### 3.5 Walidacja inputu — zawsze i wszędzie

**Reguła:** każdy input z internetu jest wrogi do dowodu, że nie jest.

```typescript
// packages/validation/src/auth.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim().max(255),
  password: z
    .string()
    .min(12, 'Minimum 12 znaków')
    .max(128)
    .regex(/[A-Z]/, 'Musi zawierać wielką literę')
    .regex(/[0-9]/, 'Musi zawierać cyfrę')
    .regex(/[^A-Za-z0-9]/, 'Musi zawierać znak specjalny'),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
```

Używana **identycznie** na frontendzie (formularz) i backendzie (route handler) — zero duplikacji.

### 3.6 RODO — wymagania prawne

| Wymóg | Implementacja |
|---|---|
| Zgoda explicit | Checkboxy regulamin + polityka prywatności w rejestracji |
| Prawo do bycia zapomnianym | `DELETE /api/users/me` — kasuje user + dogs + matches w 30 dni |
| Prawo do przenoszenia danych | `GET /api/users/me/export` — zwraca JSON z całą historią |
| Privacy by default | Lokalizacja pyta o zgodę na każdym ekranie który jej wymaga |
| Audyt logów | Każdy dostęp do wrażliwych danych loguje: kto, kiedy, co |
| Powiadomienie o naruszeniu | 72h od wykrycia — procedura w `docs/SECURITY.md` |

### 3.7 Logging — co wolno, co nie

```typescript
// apps/api/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordConfirm',
      '*.email',
      '*.phone',
      '*.chipNumber',
    ],
    censor: '[REDACTED]',
  },
});
```

### 3.8 Środowiska — separacja

```
.env.local              ← development (Twój komputer)
.env.staging            ← staging (test serwer)
.env.production         ← production (live)
```

**Reguły:**
- ❌ `.env*` **nigdy nie commitujesz** do git (`.gitignore`)
- ✅ `.env.example` z fake values jest commitowany
- ✅ Production secrets w **AWS Secrets Manager** lub **Vercel/Railway env vars**
- ✅ Każdy environment ma **inny JWT secret** i inny **ENCRYPTION_KEY**

### 3.9 Audyt zewnętrzny

- Penetration testing co kwartał (przed launch + co 3 miesiące)
- Security audit od third-party przed Series A
- Bug bounty program po launch (HackerOne / Yes We Hack)

---

## 4. Stack technologiczny {#4-stack}

### 4.1 Mobile (`apps/mobile`)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Framework | **Expo SDK 51+** | Najszybsza iteracja, OTA updates, EAS Build |
| Routing | **Expo Router** | File-based routing jak Next.js |
| State | **Zustand** | Lekki, TypeScript-first, bez boilerplate Redux |
| API client | **TanStack Query (React Query)** | Cache, retry, optimistic updates |
| Storage | **expo-secure-store** | Tokeny w Keychain/Keystore |
| Forms | **react-hook-form + zod** | Performance + walidacja |
| Animations | **react-native-reanimated 3** | 60fps na UI thread |
| Navigation | **expo-router** | Built-in z Expo |
| Auth | **Custom JWT + biometric (expo-local-authentication)** | Pełna kontrola |
| Push | **expo-notifications + FCM** | iOS + Android |
| Maps | **react-native-maps + Google Maps** | Standard branżowy |

### 4.2 Web (`apps/web`)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | RSC, SEO, Edge runtime |
| Styling | **Tailwind CSS + CSS modules** | Mobile-first, fast |
| Components | **Radix UI primitives** | Accessibility-first |
| Forms | **react-hook-form + zod** | Spójność z mobile |
| Animations | **Framer Motion** | Smooth UX |
| Analytics | **Plausible** lub **PostHog self-hosted** | RODO-friendly |

### 4.3 Backend (`apps/api`)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Stabilność |
| Framework | **Fastify 4** | 2x szybszy od Express, schema-first |
| ORM | **Prisma** | Type-safe queries, migrations |
| Database | **PostgreSQL 16** | Standard branżowy |
| Cache | **Redis 7** | Sessions, rate limiting |
| Real-time | **Socket.io** | Czat |
| Validation | **Zod** (z `packages/validation`) | DRY z frontendem |
| Auth | **Custom JWT + Argon2** | Pełna kontrola |
| Email | **Resend** lub **Postmark** | Transactional |
| Storage | **AWS S3** lub **Cloudflare R2** | Zdjęcia |

### 4.4 Infrastruktura

| Komponent | Wybór | Cena (MVP) |
|---|---|---|
| Hosting Mobile | EAS Build + App Store / Play Store | $99/rok + $25 jednorazowo |
| Hosting Web | **Vercel Pro** | $20/mies |
| Hosting API | **Railway** lub **Render** | $7-20/mies |
| Database | **Supabase** lub **Neon** | $0-25/mies |
| Redis | **Upstash** | $0-10/mies |
| Storage | **Cloudflare R2** | ~$5/mies |
| Monitoring | **Sentry** | $0-29/mies |
| Email | **Resend** | $0-20/mies |

**Razem MVP:** ~$70/miesiąc + jednorazowe $124.

---

## 5. Design system — Tinder × Family Tech {#5-design-system}

### 5.1 Filozofia stylu

Twoje pozycjonowanie: **"Tinder dla psów ze ciepłem rodzinnej apki zdrowotnej"**.

| Element | Inspiracja Tinder | Inspiracja Family Tech (Calm/Headspace/Apple Health) |
|---|---|---|
| Hero hooks | "Znajdź soulmate'a..." emocjonalne CTA | Editorial Fraunces typography |
| Swipe deck | Karty 3D, animacje, gestures | — |
| Onboarding | Szybki, gradient backgrounds | Soft warmth, illustracje, breathing room |
| Color palette | Czerwień / koral jako akcent | Ciepła czerń + krem zamiast czystej bieli |
| Typography | Bold sans-serif | Elegancki szeryf na nagłówkach |
| Photography | Pełnoekranowe portrety | Cinematic, naturalne światło |
| Microinteractions | Haptic, bouncy springs | Smooth, calming transitions |

### 5.2 Color tokens — `packages/theme/src/colors.ts`

```typescript
export const Colors = {
  // Brand primary (Tinder-warmth)
  coral: '#F08A8A',
  coralDeep: '#D85F5F',
  coralSoft: '#F4A8A8',
  coralMist: '#FCEBE7',

  // Surface (Family-tech warmth)
  cream: '#F8EFE2',
  bone: '#FAF4E9',
  paper: '#FBF3E6',
  ink: '#1B1411',          // ciepła czerń, NIE #000
  inkSoft: '#2A1F19',
  inkTint: 'rgba(27,20,17,0.6)',

  // Lines & dividers
  roseLine: '#F4C2C2',
  warmLine: '#E5DBC5',

  // Status
  success: '#4A8B5C',
  warning: '#D4A86A',
  danger: '#C95553',
  info: '#5C8AB5',

  // Text
  textHi: '#1B1411',
  textMid: '#4A3C30',
  textLow: '#6B5C4F',
  textFaint: '#9A8B7F',
} as const;

export type ColorToken = keyof typeof Colors;
```

### 5.3 Typography — `packages/theme/src/typography.ts`

```typescript
export const Fonts = {
  serif: 'Fraunces',           // editorial — H1, brand, hero
  sans: 'Cabinet Grotesk',     // UI — buttons, body, labels
} as const;

export const FontSize = {
  // Display
  hero: 44,
  display: 56,                 // landing only

  // Headings
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,

  // Body
  bodyLg: 17,
  body: 16,
  bodySm: 14,
  caption: 12,
  micro: 11,

  // Special
  cta: 14,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const LetterSpacing = {
  tight: '-0.035em',           // hero serif
  tightish: '-0.025em',        // h1, h2
  normal: '0',
  loose: '0.04em',
  looser: '0.08em',
  looseUppercase: '0.18em',    // tagline, eyebrow
} as const;

export const LineHeight = {
  tight: 1.0,                  // hero serif
  snug: 1.1,                   // h1, h2
  normal: 1.4,
  relaxed: 1.6,                // body
  loose: 1.8,
} as const;
```

### 5.4 Spacing & sizing

```typescript
export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24,
  xxl: 32, xxxl: 48, huge: 64, mega: 96,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  pill: 999,
  full: 9999,
} as const;

export const Shadow = {
  xs: { /* 0 1px 2px rgba(27,20,17,0.04) */ },
  sm: { /* 0 2px 8px rgba(27,20,17,0.06) */ },
  md: { /* 0 8px 24px rgba(27,20,17,0.08) */ },
  lg: { /* 0 16px 48px rgba(27,20,17,0.12) */ },

  // Special — coral glow for CTA
  coralGlow: { /* 0 12px 32px rgba(216,95,95,0.4) */ },

  // 3D paw button (mobile)
  pawInset: { /* inset shadows + drop */ },
} as const;
```

### 5.5 Animation tokens

```typescript
export const Easing = {
  fast: 'cubic-bezier(0.4, 0, 0.2, 1)',         // 180ms
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',     // 320ms
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // 420ms — Tinder-like
  smooth: 'cubic-bezier(0.34, 1.32, 0.64, 1)',  // 500ms — premium
} as const;

export const Duration = {
  micro: 90,
  fast: 180,
  base: 320,
  slow: 500,
  slower: 800,
} as const;
```

### 5.6 Komponenty bazowe

Wszystkie komponenty są w `apps/mobile/src/components/ui/` lub `apps/web/src/components/ui/`. Współdzielona logika w `packages/`.

**Lista core komponentów:**

| Mobile | Web | Cel |
|---|---|---|
| `PawButton` | `Button` | Przyciski (primary, secondary, ghost) |
| `PawCard` | `Card` | Kontenery treści |
| `PawInput` | `Input` | Pola formularza |
| `PawAvatar` | `Avatar` | Zdjęcia użytkowników/psów |
| `PawBadge` | `Badge` | Statusy (Aktualne, Wkrótce) |
| `SwipeCard` | — | Karta MachDog (mobile-only) |
| `Dock` | — | Bottom nav (mobile-only) |
| — | `Header` | Web nav |
| — | `Footer` | Web footer |

---

## 6. Struktura folderów {#6-struktura-folderów}

### 6.1 Pełna struktura

```
pawflow/
│
├── apps/
│   │
│   ├── mobile/
│   │   ├── app/                       # Expo Router (screens)
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── _layout.tsx
│   │   │   ├── (onboarding)/
│   │   │   │   ├── step-1-dog.tsx
│   │   │   │   ├── step-2-photos.tsx
│   │   │   │   └── step-3-traits.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx          # Home (Dom)
│   │   │   │   ├── machdog.tsx
│   │   │   │   ├── pawpanel.tsx
│   │   │   │   ├── pawmap.tsx
│   │   │   │   ├── profile.tsx
│   │   │   │   └── _layout.tsx
│   │   │   ├── modals/
│   │   │   │   ├── notifications.tsx
│   │   │   │   ├── chat.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── home/              # HomeHero, PawShortcutGrid, etc.
│   │   │   │   ├── machdog/           # SwipeCard, MatchOverlay, etc.
│   │   │   │   ├── pawpanel/
│   │   │   │   ├── pawmap/
│   │   │   │   ├── ui/                # PawButton, PawCard, etc.
│   │   │   │   └── layout/
│   │   │   │
│   │   │   ├── hooks/                 # useAuth, useDogs, useMatches
│   │   │   ├── lib/                   # secureStorage, api, analytics
│   │   │   ├── stores/                # Zustand stores
│   │   │   └── i18n/                  # pl.json, en.json
│   │   │
│   │   ├── assets/
│   │   │   ├── fonts/                 # Fraunces, Cabinet Grotesk
│   │   │   ├── images/                # hero photos
│   │   │   ├── icons/
│   │   │   └── 3d/                    # paw-3d.png (placeholder for Blender render)
│   │   │
│   │   ├── app.json                   # Expo config
│   │   ├── eas.json                   # EAS Build config
│   │   ├── metro.config.js
│   │   ├── babel.config.js
│   │   ├── tsconfig.json              # extends ../../tsconfig.base.json
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── web/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx           # Landing (główna)
│   │   │   │   ├── funkcje/page.tsx
│   │   │   │   ├── cennik/page.tsx
│   │   │   │   ├── dla-biznesu/page.tsx
│   │   │   │   ├── przewodnik/page.tsx
│   │   │   │   ├── blog/
│   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (legal)/
│   │   │   │   ├── regulamin/page.tsx
│   │   │   │   ├── polityka-prywatnosci/page.tsx
│   │   │   │   └── rodo/page.tsx
│   │   │   ├── api/                   # Edge / Serverless functions
│   │   │   │   ├── waitlist/route.ts  # Pre-rejestracja
│   │   │   │   └── contact/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── marketing/         # Hero, Pillars, Pricing, etc.
│   │   │   │   ├── ui/                # Button, Card, etc.
│   │   │   │   └── layout/            # Header, Footer
│   │   │   ├── lib/                   # analytics, seo
│   │   │   └── content/               # MDX blog posts
│   │   │
│   │   ├── public/
│   │   │   ├── og-image.jpg
│   │   │   ├── favicon.ico
│   │   │   └── robots.txt
│   │   │
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts            # /api/auth/login, /register, /refresh
│       │   │   ├── users.ts
│       │   │   ├── dogs.ts
│       │   │   ├── matches.ts
│       │   │   ├── chat.ts
│       │   │   └── waitlist.ts
│       │   │
│       │   ├── plugins/
│       │   │   ├── auth.ts            # JWT verification
│       │   │   ├── security.ts        # helmet, cors, rate-limit
│       │   │   ├── prisma.ts
│       │   │   └── socket.ts          # Socket.io
│       │   │
│       │   ├── lib/
│       │   │   ├── crypto.ts          # Argon2, AES-256
│       │   │   ├── jwt.ts
│       │   │   ├── logger.ts          # Pino with redaction
│       │   │   ├── email.ts           # Resend
│       │   │   └── storage.ts         # S3/R2
│       │   │
│       │   ├── middleware/
│       │   │   ├── requireAuth.ts
│       │   │   ├── validateBody.ts
│       │   │   └── auditLog.ts
│       │   │
│       │   └── server.ts              # Fastify entry
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       │
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   │
│   ├── theme/
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── shadows.ts
│   │   │   ├── animations.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── types/
│   │   ├── src/
│   │   │   ├── User.ts
│   │   │   ├── Dog.ts
│   │   │   ├── Match.ts
│   │   │   ├── Chat.ts
│   │   │   ├── Health.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── validation/
│   │   ├── src/
│   │   │   ├── auth.ts                # RegisterSchema, LoginSchema
│   │   │   ├── dog.ts
│   │   │   ├── waitlist.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api-client/
│   │   ├── src/
│   │   │   ├── client.ts              # axios/fetch wrapper
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── dogs.ts
│   │   │   │   └── matches.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── utils/
│       ├── src/
│       │   ├── date.ts                # formatRelative, formatDate
│       │   ├── encryption.ts          # AES helpers
│       │   ├── validation.ts          # email, phone helpers
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── tools/
│   ├── eslint-config/
│   │   ├── base.js
│   │   ├── react.js
│   │   ├── next.js
│   │   └── package.json
│   └── tsconfig/
│       ├── base.json
│       ├── react-native.json
│       ├── next.json
│       └── node.json
│
├── docs/
│   ├── ADR/
│   │   ├── 001-monorepo-structure.md
│   │   ├── 002-auth-strategy.md
│   │   └── 003-encryption-standards.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   ├── ONBOARDING.md
│   └── DESIGN_SYSTEM.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # Lint + test on PR
│   │   ├── deploy-web.yml
│   │   ├── deploy-api.yml
│   │   └── eas-build.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── .prettierrc
├── .editorconfig
├── README.md
└── CHANGELOG.md
```

### 6.2 Pliki konfiguracyjne — wzorce

**`pnpm-workspace.yaml`** (root):
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

**`package.json`** (root):
```json
{
  "name": "pawflow",
  "private": true,
  "scripts": {
    "dev:mobile": "pnpm --filter @pawflow/mobile dev",
    "dev:web": "pnpm --filter @pawflow/web dev",
    "dev:api": "pnpm --filter @pawflow/api dev",
    "dev": "pnpm run --parallel /^dev:.*/",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.15.0"
  }
}
```

**`tsconfig.base.json`** (root):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  }
}
```

**`.gitignore`** (root):
```
node_modules/
.next/
.expo/
dist/
build/
.turbo/

.env
.env.local
.env.*.local
.env.production
.env.staging

*.log
.DS_Store
.vscode/
.idea/

coverage/
.nyc_output/

apps/api/prisma/dev.db
```

---

## 7. Setup krok-po-kroku {#7-setup}

### 7.1 Wymagania wstępne

**Twój komputer musi mieć:**
- Node.js 20 LTS ([nodejs.org](https://nodejs.org))
- pnpm 8.15+ (`npm install -g pnpm`)
- Git
- VS Code (lub Cursor)
- Xcode (Mac, dla iOS) lub Android Studio (dla Android)
- Docker (dla lokalnej bazy PostgreSQL + Redis)

**Konta do założenia:**
- GitHub
- Apple Developer ($99/rok) — przed launch
- Google Play Developer ($25 jednorazowo) — przed launch
- Vercel (web hosting)
- Railway lub Render (API hosting)
- Supabase lub Neon (PostgreSQL)
- Upstash (Redis)
- Cloudflare (R2 storage + DNS)
- Sentry (monitoring)
- Resend (email)

### 7.2 Krok 1 — Inicjalizacja repozytorium

```bash
mkdir pawflow
cd pawflow
git init
pnpm init
```

Utwórz `pnpm-workspace.yaml` (treść powyżej).
Utwórz `tsconfig.base.json` (treść powyżej).
Utwórz `.gitignore` (treść powyżej).
Utwórz `.env.example` (puste, z komentarzami).

```bash
git add .
git commit -m "chore: initialize monorepo"
git branch -M main
gh repo create pawflow --private
git push -u origin main
```

### 7.3 Krok 2 — Pakiety bazowe

```bash
mkdir -p packages/theme/src packages/types/src packages/validation/src packages/utils/src
```

W każdym `packages/*/package.json` ustaw:
```json
{
  "name": "@pawflow/theme",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

Skopiuj kod z sekcji **5.2-5.5** do odpowiednich plików.

### 7.4 Krok 3 — API backend

```bash
mkdir -p apps/api
cd apps/api
pnpm init

pnpm add fastify @fastify/helmet @fastify/cors @fastify/rate-limit @fastify/jwt
pnpm add @prisma/client argon2 jsonwebtoken pino zod socket.io
pnpm add @pawflow/types @pawflow/validation @pawflow/utils

pnpm add -D typescript tsx prisma @types/jsonwebtoken @types/node
```

Inicjalizacja Prisma:
```bash
pnpm prisma init --datasource-provider postgresql
```

Skopiuj `schema.prisma` z `docs/SCHEMA.md` (poniżej, sekcja 7.7).

### 7.5 Krok 4 — Mobile app

```bash
cd ../..
pnpm dlx create-expo-app@latest apps/mobile --template blank-typescript
cd apps/mobile

pnpm add expo-router expo-secure-store expo-local-authentication
pnpm add expo-notifications expo-image expo-linear-gradient
pnpm add @tanstack/react-query zustand react-hook-form @hookform/resolvers/zod
pnpm add react-native-reanimated react-native-gesture-handler
pnpm add react-native-maps react-native-svg
pnpm add @pawflow/theme @pawflow/types @pawflow/validation @pawflow/api-client

# Fonts
pnpm add @expo-google-fonts/fraunces expo-font
```

Skonfiguruj Expo Router w `app.json`:
```json
{
  "expo": {
    "scheme": "pawflow",
    "plugins": ["expo-router", "expo-secure-store"]
  }
}
```

### 7.6 Krok 5 — Web (landing)

```bash
cd ../..
pnpm dlx create-next-app@latest apps/web --typescript --tailwind --app --no-src-dir
cd apps/web

pnpm add framer-motion lucide-react
pnpm add @pawflow/theme @pawflow/validation
pnpm add -D @types/node
```

Skonfiguruj `tailwind.config.ts`:
```typescript
import { Colors, Spacing, BorderRadius } from '@pawflow/theme';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: Colors,
      spacing: Spacing,
      borderRadius: BorderRadius,
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Cabinet Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 7.7 Krok 6 — Schema bazy danych

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique @db.VarChar(255)
  passwordHash    String
  emailVerified   Boolean   @default(false)
  emailVerifyToken String?
  resetToken      String?
  resetTokenExp   DateTime?

  // Profile
  firstName       String?   @db.VarChar(100)
  lastName        String?   @db.VarChar(100)
  phoneEncrypted  String?   // AES-256 encrypted

  // Location (with consent)
  locationLat     Float?
  locationLng     Float?
  locationCity    String?
  locationConsent Boolean   @default(false)

  // Subscription
  plan            Plan      @default(FREE)
  planExpiresAt   DateTime?

  // Privacy
  consentTerms    DateTime
  consentPrivacy  DateTime
  consentMarketing DateTime?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  lastIpHash      String?

  // Soft delete (for GDPR right-to-be-forgotten 30-day window)
  deletedAt       DateTime?

  // Relations
  dogs            Dog[]
  refreshTokens   RefreshToken[]
  sessions        Session[]
  auditLogs       AuditLog[]

  @@index([email])
  @@index([deletedAt])
}

model Dog {
  id              String    @id @default(cuid())
  ownerId         String
  owner           User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  name            String    @db.VarChar(50)
  breed           String?   @db.VarChar(100)
  birthDate       DateTime?
  sex             Sex
  size            DogSize
  chipNumberEncrypted String? // AES-256 encrypted

  // Profile
  bio             String?   @db.VarChar(500)
  traits          String[]  // ['energetic', 'friendly', 'shy']
  activityLevel   ActivityLevel @default(MODERATE)

  // Photos
  photos          Photo[]

  // Health (PawPanel)
  weight          Float?
  weightHistory   WeightEntry[]
  vaccinations    Vaccination[]
  visits          VetVisit[]

  // MachDog
  swipesGiven     Swipe[]   @relation("Swiper")
  swipesReceived  Swipe[]   @relation("Swipee")

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([ownerId])
}

// ... pozostałe modele: Photo, Vaccination, VetVisit, Match, Chat, Message, Swipe, RefreshToken, Session, AuditLog
// (pełny schema w docs/SCHEMA.md)

enum Plan {
  FREE
  PLUS
  PRO
}

enum Sex {
  MALE
  FEMALE
}

enum DogSize {
  SMALL
  MEDIUM
  LARGE
}

enum ActivityLevel {
  CALM
  MODERATE
  ACTIVE
}
```

### 7.8 Krok 7 — Pierwsza migracja

```bash
cd apps/api
docker run --name pawflow-postgres -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
echo "DATABASE_URL=postgresql://postgres:dev@localhost:5432/pawflow" > .env

pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 7.9 Krok 8 — Pierwszy build i test

```bash
cd ../..
pnpm install              # zainstaluje wszystko w monorepo
pnpm dev:api              # terminal 1
pnpm dev:web              # terminal 2 — http://localhost:3000
pnpm dev:mobile           # terminal 3 — Expo Go QR code
```

### 7.10 Krok 9 — CI/CD

`.github/workflows/ci.yml`:
```yaml
name: CI
on:
  pull_request:
  push: { branches: [main] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
```

---

## 8. Mobile-first — zasady {#8-mobile-first}

### 8.1 Reguła kciuka

Każda interakcja musi być wykonalna **kciukiem jednej ręki na telefonie 6.1"**. Strefa zasięgu kciuka:

```
┌─────────────────┐
│ 🚫 niedostępne   │ ← top — tylko logo, bell (rzadko)
│                 │
├─────────────────┤
│                 │
│  ✅ łatwe        │ ← middle — primary content
│                 │
├─────────────────┤
│                 │
│  ✅ idealne      │ ← bottom — CTA, dock, primary actions
│ kciuk           │
└─────────────────┘
```

**Konsekwencje:**
- Primary CTA zawsze w dolnej 1/3 ekranu
- Dock zawsze widoczny (poza modalami)
- Destruktywne akcje (delete) wymagają potwierdzenia (long press lub modal)

### 8.2 Touch targets

- Minimum **44×44pt** (Apple HIG) lub **48×48dp** (Material)
- Spacing między klikabilnymi elementami: minimum **8pt**
- Nigdy nie umieszczaj 2 klikabilnych elementów <44pt od siebie

### 8.3 Safe area

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['top', 'bottom']} style={styles.root}>
  {/* content */}
</SafeAreaView>
```

### 8.4 Performance budget

- TTI (Time to Interactive) < **1.5s** na cold start
- 60fps scroll na liście 100+ elementów
- Image loading z `expo-image` (cached + optimized)
- FlatList (nie ScrollView) dla list >20 elementów

### 8.5 Web mobile-first

```css
/* tailwind.config.ts */
screens: {
  sm: '640px',   // mobile landscape
  md: '768px',   // tablet
  lg: '1024px',  // desktop
  xl: '1280px',  // large desktop
}
```

Zasada Tailwind: zawsze pisz mobile, dodawaj `md:`, `lg:` dla większych:
```html
<div className="text-base md:text-lg lg:text-xl">
```

### 8.6 Breakpointy testów

Minimum testowane wymiary:
- **iPhone SE** (375×667) — najmniejszy iOS
- **iPhone 15** (393×852) — typowy
- **iPhone 15 Pro Max** (430×932) — największy iOS
- **Samsung Galaxy S23** (360×780) — typowy Android
- **iPad Mini** (744×1133) — tablet (Faza 2)

---

## 9. Konwencje kodu {#9-konwencje}

### 9.1 TypeScript

- ✅ `strict: true` zawsze
- ✅ `noUncheckedIndexedAccess: true`
- ❌ Zero `any` (jeśli musisz, użyj `unknown`)
- ❌ Zero `// @ts-ignore` (jeśli musisz, dodaj komentarz dlaczego)

### 9.2 Naming

| Element | Konwencja | Przykład |
|---|---|---|
| Komponenty | PascalCase | `PawButton.tsx` |
| Hooki | camelCase z `use` | `useAuth.ts` |
| Utility | camelCase | `formatDate.ts` |
| Types | PascalCase | `User`, `DogProfile` |
| Constants | SCREAMING_SNAKE | `MAX_PHOTOS_PER_DOG` |
| Files | kebab-case dla routes | `app/(auth)/forgot-password.tsx` |

### 9.3 Komponenty React

```typescript
// ✅ Dobre
type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function PawButton({ label, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable onPress={onPress} style={styles[variant]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

// ❌ Złe — default export, nazwy jednoliterowe, brak typów
export default ({ l, o }) => <Pressable onPress={o}><Text>{l}</Text></Pressable>;
```

### 9.4 Komentarze

- **Po angielsku w kodzie** (international standard)
- **Po polsku w UI** (strings.pl.ts)
- Komentarz tylko gdy *dlaczego*, nie *co* (kod sam mówi *co*)

```typescript
// ❌ Złe — opisuje co, nie dlaczego
// Increment counter
counter++;

// ✅ Dobre — wyjaśnia decyzję
// Argon2id with OWASP 2024+ recommended parameters; do not lower memoryCost
// without consulting security team — affects brute-force resistance.
const hash = await argon2.hash(password, { memoryCost: 19456 });
```

### 9.5 Git workflow

**Branch naming:**
```
feature/machdog-swipe-deck
fix/login-rate-limit
chore/upgrade-expo-51
docs/security-runbook
```

**Commit messages (Conventional Commits):**
```
feat(machdog): implement swipe deck with gestures
fix(auth): rotate refresh token on use
chore(deps): bump expo to 51.0.5
docs(security): add incident response procedure
```

**PR checklist:**
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Tested on iOS + Android (mobile changes)
- [ ] Tested on Chrome + Safari (web changes)
- [ ] No new dependencies without approval
- [ ] No secrets in code
- [ ] RODO/security implications considered

---

## 10. Workflow dla agenta AI w VS Code {#10-workflow-agenta}

### 10.1 Co agent ZAWSZE robi

1. **Czyta tę instrukcję** przed rozpoczęciem nowego feature
2. **Szuka istniejących wzorców** w kodzie zanim napisze nowy komponent
3. **Importuje z `@pawflow/theme`** zamiast hardkodować kolory
4. **Importuje z `@pawflow/types`** zamiast definiować lokalne typy
5. **Walidacja przez `@pawflow/validation`** — frontend i backend ten sam schemat
6. **Mobile-first** — pisze styl bazowy dla najmniejszego ekranu
7. **TypeScript strict** — zero `any`, pełne typy
8. **Komentarze EN, UI po PL** z `strings.pl.ts`
9. **Bezpieczeństwo first** — pyta zanim doda dependency, nigdy nie loguje secrets
10. **Testuje na realnym wymiarze** — 375×812 minimum

### 10.2 Co agent NIGDY nie robi

- ❌ Hardcoduje kolorów, fontów, spacing'u
- ❌ Używa `localStorage` lub `AsyncStorage` dla wrażliwych danych
- ❌ Loguje request body, headers, tokeny
- ❌ Wysyła hasła jako plain text gdziekolwiek
- ❌ Pomija walidacji backendowej "bo frontend już sprawdza"
- ❌ Dodaje dependency >50KB bez sprawdzenia bundle size impact
- ❌ Używa `dangerouslySetInnerHTML` lub `eval`
- ❌ Wymyśla nowe konwencje gdy istnieją w `docs/`
- ❌ Pisze testy które testują implementację zamiast zachowania
- ❌ Pomija safe area na mobile

### 10.3 Sequence — jak agent buduje nowy ekran

```
1. ZAPYTAJ: która faza projektu? (MVP / Faza 2 / Faza 3+)
2. ZAPYTAJ: czy to nowy ekran czy modyfikacja istniejącego?
3. PRZEGLĄDNIJ docs/ARCHITECTURE.md
4. PRZEGLĄDNIJ podobne ekrany w apps/mobile/app/
5. ZAPLANUJ:
   - Jakie typy potrzebuję? → packages/types/
   - Jaka walidacja? → packages/validation/
   - Jakie API endpointy? → apps/api/src/routes/
   - Jakie komponenty UI? → apps/mobile/src/components/
6. NAPISZ TYPY pierwsze
7. NAPISZ API endpoint (jeśli potrzeba)
8. NAPISZ VALIDATION schema
9. NAPISZ HOOKI (useAuth, useDogs, etc.)
10. NAPISZ KOMPONENTY UI
11. NAPISZ EKRAN składający to wszystko
12. DODAJ accessibility (accessibilityLabel)
13. PRZETESTUJ na 375px i 430px
14. NAPISZ TESTY (minimum: happy path + 1 edge case)
15. COMMIT z Conventional Commits message
```

### 10.4 Cursor / Claude Code rules

W folderze `.cursorrules` (Cursor) lub `CLAUDE.md` (Claude Code) umieść:

```markdown
You are working on PawFlow — Polish dog community + matchmaking app.

## ALWAYS read first
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/DESIGN_SYSTEM.md`
- `INSTRUKCJA_AGENTA.md`

## Project structure
- Monorepo with pnpm workspaces
- `apps/mobile` — Expo + React Native (PRIMARY product)
- `apps/web` — Next.js 14 (landing + pricing + blog)
- `apps/api` — Fastify + Prisma + PostgreSQL
- `packages/theme` — design tokens (single source of truth)
- `packages/types` — TypeScript types
- `packages/validation` — Zod schemas (shared frontend + backend)

## Critical rules
1. SECURITY FIRST: Argon2id passwords, JWT 15min/7d, expo-secure-store, RODO compliant
2. NO hardcoded colors/fonts/spacing — always import from @pawflow/theme
3. NO `any` in TypeScript — use `unknown` if you must
4. Mobile-first: write styles for 375px, scale up
5. Comments in English, UI strings in Polish via strings.pl.ts
6. NEVER log passwords, tokens, PII
7. Validate on both frontend AND backend with the same Zod schema
8. Touch targets minimum 44x44pt
9. Test on iOS + Android before marking done

## When in doubt
- Ask the user before adding new dependencies
- Ask before changing folder structure
- Ask before modifying packages/theme tokens
- Reference Pawflow_UI.png for visual reference
```

---

## 11. Prompty gotowe do użycia {#11-prompty}

Skopiuj te prompty do agenta gdy potrzebujesz konkretnej pracy.

### 11.1 Setup pierwszego ekranu — HomeScreen

```
Zbuduj HomeScreen w apps/mobile/app/(tabs)/index.tsx zgodnie z mockupem
Pawflow_UI.png i instrukcją sekcja 5 (Design System).

Wymagania:
- Pełnoekranowa fotografia psa jako tło (assets/images/hero-dog.jpg)
- Logo "Pawflow" w Fraunces 700 + tagline "MIŁOŚĆ NA CZTERECH ŁAPACH"
- Bell-with-dot prawy górny róg
- H1 "Znajdź soulmate'a dla swojego psa" w Fraunces 500
- Subtext 2-liniowy
- Primary CTA "Zacznij dopasowanie" z gradientem coral→coralDeep
- PawShortcutGrid: 6 przycisków 3D (sekcja 5.6 instrukcji)
- Dock: 5 zakładek (Dom, MachDog, PawPanel, PawMap, Profil)

Importy:
- Colors, Fonts, FontSize z @pawflow/theme
- strings.pl.ts dla tekstów

Animacje wejścia:
- hero photo: opacity 0→1 (300ms)
- copy: stagger 100ms
- shortcuts: scale-in z bounce, 60ms stagger
- dock: translateY 80→0

Bezpieczeństwo: zakładam że user jest zalogowany (sprawdź useAuth hook).
Touch targets min 44pt. Safe area top + bottom.

Po zakończeniu napisz mi commit message w Conventional Commits.
```

### 11.2 Setup landing page

```
Zbuduj główną stronę landingu w apps/web/app/(marketing)/page.tsx.

Sekcje (kolejność scroll):
1. Sticky nav (logo + linki + CTA "Pobierz")
2. Hero (H1 + subtext + 2x CTA + phone mockup)
3. Social proof strip (logo prasy)
4. Trzy filary (MachDog · PawPanel · PawMap)
5. Jak to działa (3-step)
6. USP grid (6 wartości)
7. Testimonials (2 cards)
8. B2B CTA section (dark)
9. Pricing (3 plany, środkowy featured)
10. Final CTA z formularzem email
11. Footer

Wymagania:
- Tailwind CSS classes only (config rozszerza @pawflow/theme)
- Framer Motion dla scroll animations (fade-in, stagger)
- Mobile-first (testuj 375px before 1280px)
- SEO meta tags w layout.tsx (title, description, og-image)
- Form do waitlisty: POST /api/waitlist (Zod validation)
- Accessibility: skip-link, semantic HTML, aria-labels

Po zakończeniu sprawdź:
- Lighthouse score >= 95 na desktop
- Lighthouse score >= 85 na mobile
- Brak console errors
- Form działa end-to-end
```

### 11.3 API endpoint — auth

```
Zbuduj endpointy auth w apps/api/src/routes/auth.ts:

POST /api/auth/register
- Body: RegisterSchema z @pawflow/validation
- Hash password z Argon2id (sekcja 3.2)
- Email verification token
- Audit log entry
- Wyślij email weryfikacyjny przez Resend
- Response: 201 + { userId, email, emailVerified: false }

POST /api/auth/login
- Body: LoginSchema
- Verify password z Argon2
- Generate access token (15min) + refresh token (7d)
- Store refresh token w bazie (RefreshToken model)
- Audit log entry
- Response: 200 + { accessToken, refreshToken, user }

POST /api/auth/refresh
- Body: { refreshToken }
- Verify token + check w bazie (rewokacja)
- Rotate: invalidate old, create new
- Response: 200 + { accessToken, refreshToken }

POST /api/auth/logout
- Header: Authorization Bearer
- Invalidate refresh token w bazie
- Response: 204

Wymagania bezpieczeństwa:
- Rate limit: 5 attempts/15min per IP na /login
- Brute force protection: lock account po 10 failed attempts (30min)
- HSTS, CORS strict
- Pino logger z redact (nigdy nie loguj password ani tokens)
- Wszystkie response codes zgodne z RFC

Testy:
- Happy path register + login
- Wrong password
- Expired refresh token
- Rate limit hit
- SQL injection attempt (Prisma chroni, ale test)

Wygeneruj też migracje Prisma jeśli potrzebne.
```

### 11.4 Komponent — PawButton

```
Zbuduj PawButton w apps/mobile/src/components/ui/PawButton.tsx.

API:
type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
};

Style (per variant):
- primary: gradient coral→coralDeep, label cream, shadow coralGlow
- secondary: bg cream, border coral, label coralDeep
- ghost: bg transparent, label coral
- destructive: bg danger, label cream

Stany:
- default
- hover (web): brightness 1.05
- active: scale(0.97), brightness 0.95
- disabled: opacity 0.45, cursor not-allowed
- loading: spinner zamiast label

Sizes:
- sm: height 40, padding 12px 16px, font 13px
- md: height 52, padding 14px 24px, font 14px
- lg: height 60, padding 16px 32px, font 16px

Accessibility:
- accessibilityRole="button"
- accessibilityState={{ disabled, busy: loading }}
- accessibilityLabel z label

Haptic (mobile):
- onPressIn: Haptics.impactAsync(level)

Animation:
- scale (Reanimated): pressed 0.97, release spring back
```

### 11.5 Migracja Prisma

```
Wygeneruj migrację Prisma dla nowego feature: PawPanel (zdrowie psa).

Modele:
- Vaccination (id, dogId, name, date, validUntil, vetId, photoUrl)
- VetVisit (id, dogId, date, notes, vetId, attachments)
- WeightEntry (id, dogId, date, weightKg)
- Medication (id, dogId, name, startDate, endDate, dosage, frequency)
- Allergy (id, dogId, name, severity, notes)

Wymagania:
- Wszystkie z onDelete: Cascade z Dog
- Audit fields: createdAt, updatedAt
- Indeks na dogId
- Validation Zod schemas w packages/validation

Po wygenerowaniu:
1. pnpm prisma migrate dev --name add-pawpanel-models
2. Update typów w packages/types/Health.ts
3. Update API client w packages/api-client/endpoints/health.ts
4. Pokaż migration SQL przed potwierdzeniem
```

---

## 12. Checklist deployment {#12-deployment}

### 12.1 Przed pierwszym deployem

```
Bezpieczeństwo:
□ Wszystkie .env w secrets manager (nie w kodzie)
□ JWT secrets minimum 256-bit, różne dla każdego env
□ HTTPS only (no HTTP fallback)
□ Rate limiting skonfigurowany na /auth, /register, /login
□ CORS whitelist tylko production domains
□ HSTS header active
□ Sentry error tracking skonfigurowany
□ Audit log dla auth events

Database:
□ Backup schedule daily (rolling 30 days)
□ Point-in-time recovery enabled
□ Read replica skonfigurowana (jeśli >5k DAU)
□ Connection pooling (PgBouncer)

App Store / Play Store:
□ Privacy policy URL działa
□ Terms of service URL działa
□ App icons w wszystkich rozmiarach
□ Screenshots po polsku
□ Description po polsku
□ Tagi keyword research (ASO)
□ TestFlight beta testers (min 100 osób)

Web:
□ Lighthouse Performance >=90
□ SEO meta tags na każdej stronie
□ sitemap.xml + robots.txt
□ OG images per page
□ 404 + 500 pages designed
□ Cookie banner (RODO)

Monitoring:
□ Sentry alerting na critical errors
□ Uptime monitoring (UptimeRobot)
□ Log aggregation (Logtail / Better Stack)
□ Performance monitoring (New Relic / Datadog)
□ User analytics (Plausible self-hosted)
```

### 12.2 Pierwsze 30 dni po launch

```
□ Daily review error logs (Sentry)
□ Weekly retencja cohort analysis
□ Weekly NPS survey (in-app)
□ Bi-weekly security audit (manual penetration test)
□ Monthly database performance review
□ Monthly cost review
□ Continuous beta tester feedback loops
```

---

## 📚 Dodatkowe dokumenty

W folderze `docs/` muszą znaleźć się:

| Plik | Zawartość | Priorytet |
|---|---|---|
| `ARCHITECTURE.md` | Diagramy, decyzje, ADR | 🔴 Krytyczny |
| `SECURITY.md` | Threat model, incident response | 🔴 Krytyczny |
| `DESIGN_SYSTEM.md` | Wszystkie tokeny, komponenty | 🔴 Krytyczny |
| `DEPLOYMENT.md` | Step-by-step deploy procedures | 🟡 Ważny |
| `ONBOARDING.md` | Dla nowych developerów | 🟡 Ważny |
| `CONTRIBUTING.md` | PR process, code review | 🟡 Ważny |
| `SCHEMA.md` | Pełny Prisma schema z opisem | 🟡 Ważny |

---

## 🎯 Co robisz teraz — pierwsze 7 dni

**Dzień 1:** Zainstaluj Node 20, pnpm, Docker. Załóż konta (GitHub, Vercel, Supabase). Sklonuj template z tej instrukcji.

**Dzień 2:** Setup monorepo. Pierwsze paczki w `packages/`. Pierwszy commit. Push na GitHub.

**Dzień 3:** Setup `apps/api`. Prisma + PostgreSQL local. Auth endpointy (register + login).

**Dzień 4:** Setup `apps/mobile`. Expo Router. Auth screens (login + register). Połączenie z API.

**Dzień 5:** Setup `apps/web`. Next.js 14. Landing page (sekcje 1-5).

**Dzień 6:** Reszta landing page (sekcje 6-12). Deploy web na Vercel preview.

**Dzień 7:** Integracje (Sentry, Resend, Cloudflare R2). Pierwszy build mobile (Expo dev client).

Po 7 dniach masz **działającą bazę pod resztę projektu**. Bez podejmowania szybkich kompromisów.

---

*PawFlow Master Instrukcja Wdrożeniowa v3.0 | Maj 2026*
*"Każdy pies zasługuje na świetne życie."*
