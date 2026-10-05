/** @type {import('tailwindcss').Config} */
// ── Change the whole app's colours here. ──
// Hex values that SVG/JS need live in src/lib/theme.js — keep the two in step.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBFAF6', // page background — clean, barely-warm white
        surface: '#FFFFFF', // cards
        line: '#ECE8DF', // hairline borders
        blue: { DEFAULT: '#9FD0F5', soft: '#E8F4FD', deep: '#3D78AE' }, // baby blue
        yellow: { DEFAULT: '#FFE07A', soft: '#FFF6D1', deep: '#C9970E' }, // pastel yellow
        pink: { DEFAULT: '#FFC4D2', soft: '#FFEEF2' }, // splash
        mint: { DEFAULT: '#B7E5CD', soft: '#E9F7EF' }, // splash
        ink: '#262A3D', // text — deep navy, never black
        'ink-soft': '#6B7088',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(38,42,61,.04), 0 10px 28px -14px rgba(38,42,61,.18)',
        pop: '0 6px 0 -2px rgba(38,42,61,.08)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(255,224,122,.9)' },
          '100%': { boxShadow: '0 0 0 16px rgba(255,224,122,0)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(0)' },
          '30%': { transform: 'rotate(-8deg)' },
          '60%': { transform: 'rotate(6deg)' },
        },
      },
      animation: {
        rise: 'rise .55s cubic-bezier(.22,1,.36,1) both',
        pop: 'pop .55s cubic-bezier(.34,1.56,.64,1)',
        glow: 'glow .8s ease-out',
        wiggle: 'wiggle .6s ease-in-out',
      },
    },
  },
  plugins: [],
}
