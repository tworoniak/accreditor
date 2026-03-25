import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3a57e8',
          700: '#2d44c7',
        },
        status: {
          upcoming: '#6b7280',
          drafted: '#8b5cf6',
          submitted: '#3b82f6',
          awaiting: '#f59e0b',
          granted: '#10b981',
          rejected: '#ef4444',
          waitlisted: '#f97316',
          shot: '#059669',
          no_show: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
