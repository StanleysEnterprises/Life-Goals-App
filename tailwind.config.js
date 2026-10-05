/** @type {import('tailwindcss').Config} */
// Colours are CSS variables so light and dark mode share every class.
// ── Change the actual colour values in src/theme.css ──
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: v('canvas'),
        surface: v('surface'),
        line: v('line'),
        blue: { DEFAULT: v('blue'), soft: v('blue-soft'), deep: v('blue-deep') },
        yellow: { DEFAULT: v('yellow'), soft: v('yellow-soft'), deep: v('yellow-deep') },
        pink: { DEFAULT: v('pink'), soft: v('pink-soft') },
        mint: { DEFAULT: v('mint'), soft: v('mint-soft') },
        ink: v('ink'),
        'ink-soft': v('ink-soft'),
        onaccent: v('on-accent'), // text sitting on a yellow/blue fill — always dark
        shade: v('shade'), // modal backdrop
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .05), 0 10px 28px -14px rgb(var(--shadow) / .22)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(.22,1,.36,1)',
        bouncy: 'cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(.75)' },
          '70%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--yellow) / .9)' },
          '100%': { boxShadow: '0 0 0 16px rgb(var(--yellow) / 0)' },
        },
        toast: {
          '0%': { opacity: '0', transform: 'translate(-50%, -6px)' },
          '12%,80%': { opacity: '1', transform: 'translate(-50%, 0)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -6px)' },
        },
      },
      animation: {
        rise: 'rise .55s cubic-bezier(.22,1,.36,1) both',
        pop: 'pop .55s cubic-bezier(.34,1.56,.64,1)',
        glow: 'glow .8s ease-out',
        toast: 'toast 2.2s ease both',
      },
    },
  },
  plugins: [],
}
