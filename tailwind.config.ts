import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#E8DFD3',
          300: '#DBCDBB',
          400: '#C1A98B',
          500: '#A7855B',
          600: '#8B6D47',
          700: '#6F5638',
          800: '#533F2A',
          900: '#37281B',
        },
        accent: {
          50: '#FEF2F0',
          100: '#FDE5E1',
          200: '#FBCBC3',
          300: '#F9B1A5',
          400: '#F57D69',
          500: '#C84B31',
          600: '#A03C27',
          700: '#782D1D',
          800: '#501E13',
          900: '#280F0A',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;