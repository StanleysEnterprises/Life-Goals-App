// Colour references for SVG and inline styles. Values come from src/theme.css,
// so they switch automatically between light and dark mode.
const c = (name, a) => (a === undefined ? `rgb(var(--${name}))` : `rgb(var(--${name}) / ${a})`)

export const THEME = {
  canvas: c('canvas'),
  line: c('line'),
  blue: c('blue'),
  yellow: c('yellow'),
  yellowSoft: c('yellow-soft'),
  pink: c('pink'),
  mint: c('mint'),
}

// Each person's colour (tabs, Compare charts, name highlight)
export const PERSON_HEX = { tegan: c('tegan'), will: c('will') }

// Heatmap shades, light → full
export const heat = (r) => c('heat', 0.15 + r * 0.85)

// Fixed pastels for confetti (look good on light and dark)
export const CONFETTI = ['#FFD43B', '#6FB8F0', '#FF9FB8', '#7FD6A8', '#FFE07A', '#9FD0F5']
