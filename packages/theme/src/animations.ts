// CSS cubic-bezier strings — convert to Reanimated Easing on mobile.
export const Easing = {
  fast: 'cubic-bezier(0.4, 0, 0.2, 1)',        // 180ms — standard material
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',    // 320ms
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // 420ms — Tinder-like spring
  smooth: 'cubic-bezier(0.34, 1.32, 0.64, 1)', // 500ms — premium feel
} as const;

export const Duration = {
  micro: 90,
  fast: 180,
  base: 320,
  slow: 500,
  slower: 800,
} as const;

export type EasingToken = keyof typeof Easing;
export type DurationToken = keyof typeof Duration;
