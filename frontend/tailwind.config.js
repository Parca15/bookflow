/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#E0EEFF',
          200: '#C8E0FF',
          300: '#9EC5FF',
          400: '#7572FF',
          500: '#0088CC',
          600: '#006FA0',
          700: '#005880',
          800: '#004560',
          900: '#003345',
        },
        mint: {
          50: '#EDFFFA',
          100: '#D5FFED',
          200: '#A8F5D8',
          300: '#4ED4B3',
          400: '#2BBF94',
          500: '#1AA87E',
          600: '#148565',
          700: '#116850',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.03em',
        normal: '0em',
        wide: '0.02em',
      },
      fontSize: {
        display: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h2: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        body: ['1.0625rem', { lineHeight: '1.6' }],
        small: ['1rem', { lineHeight: '1.5' }],
        caption: ['0.875rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(30,30,46,0.04), 0 1px 2px rgba(30,30,46,0.06)',
        'apple-md': '0 4px 12px rgba(30,30,46,0.08), 0 2px 4px rgba(30,30,46,0.04)',
        'apple-lg': '0 12px 28px rgba(30,30,46,0.1), 0 4px 8px rgba(30,30,46,0.06)',
        'apple-sm': '0 1px 2px rgba(30,30,46,0.04)',
      },
    },
  },
  plugins: [],
}