/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1a2236',
          600: '#243049',
        },
        shield: {
          50: '#e6f7ff',
          100: '#b3e6ff',
          200: '#80d5ff',
          300: '#4dc4ff',
          400: '#1ab3ff',
          500: '#00a3ff',
          600: '#0082cc',
          700: '#006199',
          800: '#004166',
          900: '#002033',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 163, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 163, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
