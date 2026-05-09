# PawFlo — Design System

> Regime: **Soulmate** — Tinder × Family Tech  
> Single source of truth: `packages/theme/src/`

---

## Philosophy

Two emotional registers, one product:

- **Tinder energy** — swipe deck, 3D card tilt, haptic feedback, gradient brand color, emotional copy
- **Family Tech calm** — editorial serif, warm black instead of pure white, natural palette, breathing room, soft transitions

The result: *a dating app that feels trustworthy enough for your dog*.

---

## Colors

All tokens in `packages/theme/src/colors.ts`. Import via `@pawflo/theme`.

### Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `coral` | `#F08A8A` | Primary brand, CTA background, active states |
| `coralDeep` | `#D85F5F` | Gradient end, pressed state |
| `coralSoft` | `#F4A8A8` | Tagline, soft accents, secondary highlights |
| `cream` | `#F8EFE2` | Text on dark backgrounds, paw buttons |
| `bone` | `#FAF4E9` | Secondary text, muted elements |
| `ink` | `#1B1411` | Warm black — NEVER use `#000000` |
| `inkSoft` | `#2A1F19` | Secondary surfaces, card backgrounds |

### Semantic

| Token | Maps to | Usage |
|---|---|---|
| `background` | `ink` | App background |
| `surface` | `inkSoft` | Cards, modals |
| `text` | `cream` | Primary text |
| `textFaint` | `bone` + opacity | Placeholder, secondary |
| `primary` | `coral` | Buttons, links |

### Forbidden

- `#FF6B35` — old orange palette (removed)
- `#000000` — cold black, off-brand
- Any green as primary color

---

## Typography

### Fonts

| Role | Family | Weights | Variable |
|---|---|---|---|
| **Serif** | Fraunces | 500 (Medium), 700 (Bold) | `opsz: 144` for hero |
| **Sans** | Cabinet Grotesk | 400, 500, 700, 800 | — |

```ts
// packages/theme/src/fonts.ts
export const Fonts = {
  serif: 'Fraunces',
  serifItalic: 'Fraunces-Italic',
  serifBold: 'Fraunces-Bold',
  serifBoldItalic: 'Fraunces-BoldItalic',
  sans: 'Cabinet Grotesk',
  sansMedium: 'Cabinet Grotesk-Medium',
  sansBold: 'Cabinet Grotesk-Bold',
  sansExtrabold: 'Cabinet Grotesk-Extrabold',
};
```

### Scale (mobile)

| Token | Size | Usage |
|---|---|---|
| `h1` | 32 | Hero headings (Fraunces) |
| `h2` | 24 | Section headings (Fraunces or sans-bold) |
| `h3` | 20 | Card titles |
| `h4` | 18 | Sub-headings |
| `body` | 16 | Body text |
| `bodySm` | 14 | Secondary info |
| `caption` | 12 | Labels, timestamps |

### Rules

- Fraunces → logo, hero H1, editorial headers, emotional moments
- Cabinet Grotesk → UI, body, buttons, labels, forms
- Fraunces italic → taglines, marketing emphasis
- Line height: 1.5× font size for body, 1.2× for headings

---

## Spacing

Base unit: **4pt**

| Token | Value | Usage |
|---|---|---|
| `xs` | 4 | Icon padding |
| `sm` | 8 | Gap between related elements |
| `md` | 16 | Standard component padding |
| `lg` | 24 | Section spacing |
| `xl` | 32 | Screen padding top/bottom |
| `xxl` | 48 | Hero sections |

---

## Touch Targets

- Minimum **44×44pt** (Apple HIG) / **48×48dp** (Material)
- Use `hitSlop` when visual size is smaller than 44pt:
  ```tsx
  <Pressable hitSlop={12} ...>
  ```
- Never place two tappable elements closer than 8pt

---

## SwipeCard

The core MachDog interaction. Built with Reanimated 3 (UI thread, 60fps guaranteed).

```
┌──────────────────────┐
│  [photo carousel]    │  ← tap to advance photos
│  [dots indicator]    │  ← 1 dot per photo
│                      │
│  LUBIĘ ←  → PASS     │  ← overlay badges appear on drag
│                      │
│ Dog Name, 2 lata     │
│ Golden Retriever  M  │  ← size pill
│ 📍 Warszawa          │
│ Bio preview text…    │
│                      │
│   [✕]        [♥]    │  ← 60×60pt, min 32px gap
└──────────────────────┘
```

**Gesture:** `Gesture.Pan().minDistance(0)` — captures both drags and taps  
**Swipe threshold:** 28% of screen width  
**Exit animation:** 240ms `withTiming` → calls `onSwipe()` callback  
**Haptic:** `notificationAsync(Success)` on LIKE, `impactAsync(Light)` on PASS

---

## Navigation — Dock

5 tabs at bottom:

| Tab | Icon | Route |
|---|---|---|
| MachDog | paw | `/(tabs)/` |
| Dopasowania | heart | `/(tabs)/matches` |
| PawMap | map | `/(tabs)/pawmap` |
| PawPanel | medical-bag | `/(tabs)/health` |
| Profil | person | `/(tabs)/profile` |

**Badge:** Match count on heart icon — driven by `matchBadgeStore` (Zustand).  
**Safe area:** Dock always uses `edges={['bottom']}` for iPhone notch/home bar.

---

## Forms

```tsx
// Standard form field pattern:
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <TextInput
      style={[styles.input, errors.email && styles.inputError]}
      value={value}
      onChangeText={onChange}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={Colors.textFaint}
    />
  )}
/>
{errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
```

**Library:** `react-hook-form` + `@hookform/resolvers/zod` — always backed by `@pawflo/validation` schema.

---

## Accessibility

Every interactive element must have:
```tsx
accessibilityRole="button"   // or "link", "header", etc.
accessibilityLabel="Czytelny opis akcji"
accessibilityState={{ disabled: isLoading }}
```

- Minimum contrast ratio: 4.5:1 (WCAG AA)
- `cream` on `ink` = 12.6:1 ✓ (exceeds AAA)
- `coral` on `ink` = 3.2:1 — acceptable for large text (≥18pt), avoid for small body

---

## Animation Principles

| Interaction | Library | Duration |
|---|---|---|
| Swipe card | Reanimated 3 (UI thread) | 240ms exit |
| Screen transitions | Expo Router default | 350ms |
| Button press | Reanimated / scale | 100ms |
| Modal appear | `withSpring` | spring (no explicit duration) |

**Rule:** Never use `Animated` API from React Native for new animations — always Reanimated 3. The old API runs on JS thread and drops frames during API calls.

---

## Component Checklist

Before marking a component complete:

- [ ] Uses `@pawflo/theme` tokens (no hardcoded colors/sizes)
- [ ] Polish strings from `strings.pl.ts` (no hardcoded UI text)
- [ ] Touch targets ≥ 44pt
- [ ] `accessibilityLabel` and `accessibilityRole` set
- [ ] Tested on 375px (iPhone SE) — smallest target
- [ ] Tested on 430px (iPhone Pro Max) — largest common
- [ ] `SafeAreaView` with correct `edges` prop
- [ ] Loading + error states handled
