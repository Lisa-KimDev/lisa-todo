/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lisa: {
          black: '#111111',
          white: '#ffffff',
          yellow: '#e7f900',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(231, 249, 0, 0.18)',
      },
    },
  },
  plugins: [],
};
