/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Exact palette from the project brief
        canvas: '#F5F5F0', // background
        sand: '#E6D8C3', // surfaces / cards
        taupe: '#C2A68C', // accents / borders
        sage: '#5D866C', // primary / success / active
        // Readable text tones (warm, never pure black)
        ink: '#3B3A35',
        'ink-soft': '#7D6E5E',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(59,58,53,.05), 0 10px 30px -14px rgba(59,58,53,.22)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(.22,1,.36,1)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(.8)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(93,134,108,.35)' },
          '100%': { boxShadow: '0 0 0 14px rgba(93,134,108,0)' },
        },
      },
      animation: {
        rise: 'rise .55s cubic-bezier(.22,1,.36,1) both',
        pop: 'pop .5s cubic-bezier(.22,1,.36,1)',
        glow: 'glow .9s ease-out',
      },
    },
  },
  plugins: [],
}
