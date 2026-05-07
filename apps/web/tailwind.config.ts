import type { Config } from 'tailwindcss';
import { Colors, Spacing, BorderRadius } from '@pawflo/theme';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: Colors,
      spacing: Spacing,
      borderRadius: BorderRadius,
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #F08A8A 0%, #D85F5F 100%)',
        'ink-gradient': 'linear-gradient(180deg, #1B1411 0%, #2A1F19 100%)',
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
