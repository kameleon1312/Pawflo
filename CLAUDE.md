# CLAUDE.md — PawFlo Project Rules

> Plik czytany automatycznie przez Claude Code przy każdej sesji.
> NIE usuwaj tego komentarza — przypomina, że ten plik jest święty.

---

## Co to za projekt

**PawFlo** — pierwsza polska aplikacja mobilna łącząca trzy światy dla właścicieli psów:
- **MachDog** — Tinder dla psów (swipe + dopasowania + czat)
- **PawPanel** — cyfrowy panel zdrowia (szczepienia, wizyty, waga)
- **PawMap** — interaktywna mapa usług (weterynarze, sklepy, groomery)

**Cel:** zostać nr 1 wśród aplikacji dla właścicieli psów w Polsce do 2027 roku.
**Aktualna faza:** MVP (Faza 1) — kwiecień 2026 do lipca 2026.

---

## ZAWSZE czytaj na początku każdej sesji

Przy pierwszym uruchomieniu sesji zapoznaj się z:
1. `PAWFLO_INSTRUKCJA_AGENTA_VSC.md` — master instrukcja projektu (~1100 linii)
2. `docs/ARCHITECTURE.md` — kiedy istnieje, decyzje architektoniczne
3. `docs/SECURITY.md` — kiedy istnieje, threat model i procedury
4. `docs/DESIGN_SYSTEM.md` — kiedy istnieje, tokeny i komponenty

Jeśli pliki w `docs/` jeszcze nie istnieją, korzystaj z odpowiednich sekcji w `PAWFLO_INSTRUKCJA_AGENTA_VSC.md`.

---

## Architektura projektu

Monorepo z **pnpm workspaces** (bez Turbo na MVP).

```
pawflo/
├── apps/
│   ├── mobile/        ← Expo + React Native (PRIMARY product, 80% pracy)
│   ├── web/           ← Next.js 14 (landing + cennik + blog, 15% pracy)
│   └── api/           ← Fastify + Prisma + PostgreSQL (5% pracy)
├── packages/
│   ├── theme/         ← Design tokens (single source of truth)
│   ├── types/         ← Shared TypeScript types
│   ├── validation/    ← Zod schemas (frontend + backend)
│   ├── api-client/    ← Typed API SDK
│   └── utils/         ← Helpers
├── docs/              ← Architecture decisions, runbooks
└── tools/             ← Shared ESLint, TypeScript configs
```

---

## ABSOLUTNE ZASADY — nigdy nie łamać

### 🔒 Bezpieczeństwo

1. **Hasła:** ZAWSZE Argon2id z parametrami `memoryCost: 19456, timeCost: 2, parallelism: 1`. NIGDY bcrypt, MD5, SHA-1.
2. **JWT:** access token 15min, refresh token 7 dni, ROTACJA przy każdym użyciu refresh.
3. **Storage tokenów na mobile:** TYLKO `expo-secure-store` (Keychain iOS / Keystore Android). NIGDY `AsyncStorage`, `localStorage`, `SecureStore` na zwykłej React appce.
4. **Wrażliwe pola w bazie:** AES-256-GCM encryption (numery telefonów, chip psa, adresy domowe, notatki medyczne).
5. **Logowanie:** Pino z `redact` na: passwords, tokens, headers, PII. NIGDY nie loguj tokenów ani haseł.
6. **Walidacja:** zawsze na frontend ORAZ backend, ten sam Zod schema z `@pawflo/validation`.
7. **Rate limiting:** /auth endpointy max 5 prób / 15 min per IP.
8. **HTTPS:** TLS 1.3, HSTS header, strict CORS whitelist (tylko własne domeny).
9. **RODO:** explicit consent na regulamin + politykę prywatności, prawo do bycia zapomnianym (30-dniowe okno), eksport danych (JSON).

### 💻 Kod

1. **TypeScript strict** — zero `any`. Jeśli musisz, użyj `unknown` z type guard.
2. **Zero hardkodowanych wartości** — kolory, fonty, spacing zawsze z `@pawflo/theme`.
3. **Zero hardkodowanych stringów** — UI po polsku przez `strings.pl.ts`.
4. **Naming:** komponenty PascalCase, hooki `use*`, types PascalCase, files kebab-case.
5. **Komentarze:** po angielsku w kodzie. Komentuj DLACZEGO, nie CO.
6. **Conventional Commits:** `feat(scope): message`, `fix(scope): message`, `chore(scope): message`.

### 📱 Mobile-first

1. **Pisz styl bazowy dla 375×812 (iPhone SE)** — najmniejszy iOS. Skaluj w górę przez breakpoints.
2. **Touch targets minimum 44×44pt** (Apple HIG) lub 48×48dp (Material).
3. **Zawsze SafeAreaView** z odpowiednimi `edges`.
4. **FlatList dla list >20 elementów** — nigdy ScrollView.
5. **Testy:** iOS + Android przed oznaczeniem jako gotowe.

### 🎨 Design system — Reżim "Soulmate" (Tinder × Family Tech)

**Paleta — bezwzględna:**
```
coral:        #F08A8A  (primary brand)
coralDeep:    #D85F5F  (CTA gradient end)
coralSoft:    #F4A8A8  (tagline, accents)
cream:        #F8EFE2  (paw buttons, text on dark)
bone:         #FAF4E9  (secondary text)
ink:          #1B1411  (warm black, NIGDY #000)
inkSoft:      #2A1F19  (secondary surfaces)
```

**Niedozwolone:** pomarańcz #FF6B35 (stara paleta), zieleń jako primary, czysty czarny #000.

**Typografia:**
- **Fraunces** (serif) — logo, hero H1, nagłówki edytorskie. `font-variation-settings: "opsz" 144` dla hero.
- **Cabinet Grotesk** (sans) — UI, body, buttons, labels.
- Fraunces używa wagi 500 (medium) lub 700 (bold) z italic dla emphasis.

**Filozofia stylu:**
- Tinder: emocjonalny copy, swipe deck, kart 3D, gradient brand color, haptic feedback
- Family Tech (Calm/Headspace): editorial szeryf, ciepła czerń zamiast bieli, naturalne kolory, breathing room, soft transitions

---

## NIGDY nie rób bez pytania

- Dodawanie nowej zależności >50KB (sprawdź bundle size impact)
- Zmiana struktury folderów
- Modyfikacja tokenów w `@pawflo/theme`
- Użycie `dangerouslySetInnerHTML` lub `eval`
- Destruktywne komendy (`rm -rf`, `DROP DATABASE`)
- Commit secrets, .env files, klucze API
- Pominięcie walidacji backendowej "bo frontend już sprawdza"

---

## Workflow dla nowego feature'u

Zanim napiszesz pierwszą linię kodu nowego feature'u:

```
1. ZAPYTAJ użytkownika: która faza projektu? (MVP / Faza 2 / Faza 3+)
2. PRZEJRZYJ podobne ekrany w apps/mobile/app/ (znajdź wzorzec)
3. ZAPLANUJ:
   - Jakie typy potrzebuję? → packages/types/
   - Jaka walidacja? → packages/validation/
   - Jakie API endpointy? → apps/api/src/routes/
   - Jakie komponenty UI? → apps/mobile/src/components/
4. NAPISZ TYPY pierwsze (TypeScript)
5. NAPISZ API endpoint (jeśli potrzeba)
6. NAPISZ VALIDATION schema (Zod, w packages/validation)
7. NAPISZ HOOKI (useAuth, useDogs, etc.)
8. NAPISZ KOMPONENTY UI (od atomów do molekuł)
9. NAPISZ EKRAN składający to wszystko
10. DODAJ accessibility (accessibilityLabel, role, state)
11. PRZETESTUJ na 375px i 430px
12. NAPISZ TESTY (minimum: happy path + 1 edge case)
13. COMMIT z Conventional Commits message
```

---

## Stack techniczny — bez improwizacji

**Mobile (`apps/mobile`):**
- Expo SDK 51+, Expo Router (file-based)
- Zustand (state), TanStack Query (server state)
- expo-secure-store (tokens), react-hook-form + zod (forms)
- react-native-reanimated 3 (60fps animations)
- expo-notifications + FCM (push)

**Web (`apps/web`):**
- Next.js 14 App Router, RSC
- Tailwind CSS (rozszerza @pawflo/theme)
- Radix UI primitives (a11y), Framer Motion (animations)
- Plausible lub PostHog self-hosted (analytics, RODO-friendly)

**Backend (`apps/api`):**
- Node.js 20 LTS, Fastify 4
- Prisma + PostgreSQL 16
- Redis 7 (sessions, rate limit)
- Socket.io (real-time chat)
- Argon2 (passwords), Pino (logger)
- Resend lub Postmark (email)
- AWS S3 lub Cloudflare R2 (storage)

---

## Komendy projektowe

```bash
# Setup po klonie
pnpm install

# Development
pnpm dev:api          # Backend na :3001
pnpm dev:web          # Landing na :3000
pnpm dev:mobile       # Expo dev server (QR code)

# Quality
pnpm type-check       # TypeScript
pnpm lint             # ESLint wszędzie
pnpm test             # Vitest

# Database
pnpm --filter @pawflo/api prisma migrate dev
pnpm --filter @pawflo/api prisma studio
```

---

## Format odpowiedzi

Gdy wykonujesz zadanie:

1. **Krótko opisz plan** (2-3 zdania) zanim zaczniesz zmiany
2. **Pokazuj diff przed apply** — szczególnie dla wielu plików
3. **Po wykonaniu napisz:**
   - Co zostało zmienione (lista plików)
   - Czy są ryzyka lub TODO do dokończenia
   - Sugerowany commit message (Conventional Commits)
4. **Sprawdź samo z siebie** — czy zgodne z zasadami z tego pliku?

---

## Kiedy się wahać — pytaj

- Architektura (zmiana struktury folderów, dodanie nowej technologii)
- Bezpieczeństwo (nowy endpoint, dane wrażliwe, zewnętrzne API)
- UX/Design (zmiana w widocznym dla usera komponencie)
- Wydajność (długie operacje, duże listy, ciężkie animacje)

Gdy nie wiesz — zapytaj. Lepiej minutę dłużej rozmawiać niż 3 godziny naprawiać.

---

## Dane kontekstowe

- **Język UI:** polski
- **Język kodu:** angielski (komentarze, nazwy zmiennych)
- **Strefa czasowa:** Europe/Warsaw
- **Waluta:** PLN
- **Targetowane platformy:** iOS 15+, Android 10+, mobile web 375px+
- **Targetowani użytkownicy:** Polska (Warszawa, Kraków na start), 25-50 lat, właściciele psów

---

*Plik wzorcowy v1.0 dla Claude Code. Last updated: maj 2026.*
*"Każdy pies zasługuje na świetne życie."*
