export const Fonts = {
  serif: 'Fraunces',        // editorial — H1, brand, hero
  sans: 'Cabinet Grotesk',  // UI — buttons, body, labels
} as const;

export const FontSize = {
  // Display
  hero: 44,
  display: 56,   // landing only

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
  tight: '-0.035em',       // hero serif
  tightish: '-0.025em',    // h1, h2
  normal: '0',
  loose: '0.04em',
  looser: '0.08em',
  looseUppercase: '0.18em', // tagline, eyebrow
} as const;

export const LineHeight = {
  tight: 1.0,    // hero serif
  snug: 1.1,     // h1, h2
  normal: 1.4,
  relaxed: 1.6,  // body
  loose: 1.8,
} as const;

export type FontToken = keyof typeof Fonts;
export type FontSizeToken = keyof typeof FontSize;
export type FontWeightToken = keyof typeof FontWeight;
