import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#F5F5F7',
        accent: '#4F46E5',
        'card-dark': '#1C1C2E',
        'card-darker': '#15152A',
        // Screenshot-matched palette
        'header-blue': '#1E3A8A',
        'content-green': '#10B981',
        'card-blue': '#2563EB',
        'card-orange': '#F97316',
        'text-dark': '#0F172A',
        'status-bar': '#111827',
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        card: '4px 4px 0px rgba(0,0,0,0.15)',
        'card-lg': '6px 6px 0px rgba(0,0,0,0.25)',
        'card-hover': '8px 8px 0px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
