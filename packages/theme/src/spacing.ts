export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  mega: 96,
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

// React Native shadow objects. For web (Tailwind), use the CSS strings in comments.
export const Shadow = {
  // css: '0 1px 2px rgba(27,20,17,0.04)'
  xs: {
    shadowColor: '#1B1411',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  // css: '0 2px 8px rgba(27,20,17,0.06)'
  sm: {
    shadowColor: '#1B1411',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // css: '0 8px 24px rgba(27,20,17,0.08)'
  md: {
    shadowColor: '#1B1411',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  // css: '0 16px 48px rgba(27,20,17,0.12)'
  lg: {
    shadowColor: '#1B1411',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 8,
  },

  // css: '0 12px 32px rgba(216,95,95,0.40)' — CTA coral glow
  coralGlow: {
    shadowColor: '#D85F5F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 6,
  },
} as const;

export type SpacingToken = keyof typeof Spacing;
export type BorderRadiusToken = keyof typeof BorderRadius;
export type ShadowToken = keyof typeof Shadow;
