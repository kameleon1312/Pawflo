import type { Config } from 'tailwindcss';
import { Colors, Spacing, BorderRadius } from '@pawflo/theme';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...Colors,
        // Soft UI surfaces and text — values come from CSS variables so light/dark can switch at runtime
        neu: {
          DEFAULT: 'var(--neu-bg)',
          hi: 'var(--neu-text-hi)',
          mid: 'var(--neu-text-mid)',
          low: 'var(--neu-text-low)',
          accent: 'var(--neu-accent)',
        },
      },
      boxShadow: {
        'neu-raised-sm': '4px 4px 10px var(--neu-lo), -4px -4px 10px var(--neu-hi)',
        'neu-raised': '8px 8px 18px var(--neu-lo), -8px -8px 18px var(--neu-hi)',
        'neu-raised-lg': '14px 14px 30px var(--neu-lo), -14px -14px 30px var(--neu-hi)',
        'neu-inset': 'inset 5px 5px 10px var(--neu-lo), inset -5px -5px 10px var(--neu-hi)',
        'neu-inset-sm': 'inset 3px 3px 6px var(--neu-lo), inset -3px -3px 6px var(--neu-hi)',
      },
      // Tailwind requires string values — convert numeric RN tokens to CSS pixel strings
      spacing: Object.fromEntries(Object.entries(Spacing).map(([k, v]) => [k, `${v}px`])),
      borderRadius: Object.fromEntries(Object.entries(BorderRadius).map(([k, v]) => [k, `${v}px`])),
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #F08A8A 0%, #D85F5F 100%)',
        'ink-gradient': 'linear-gradient(180deg, #1B1411 0%, #2A1F19 100%)',
        'hero-glow': 'radial-gradient(ellipse at 60% 50%, #F08A8A 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
