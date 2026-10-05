// Raw colour values for SVG/canvas bits Tailwind classes can't reach.
// Keep in step with tailwind.config.js.
export const THEME = {
  canvas: '#FBFAF6',
  line: '#ECE8DF',
  blue: '#9FD0F5',
  blueSoft: '#E8F4FD',
  yellow: '#FFE07A',
  yellowSoft: '#FFF6D1',
  pink: '#FFC4D2',
  mint: '#B7E5CD',
  ink: '#262A3D',
}

// Each person's colour (Compare charts, tab dot, highlights)
export const PERSON_HEX = { tegan: '#FFD45C', will: '#8CC6F2' }

// Heatmap shades (baby blue, light → full)
export const heat = (r) => `rgba(120,184,236,${0.15 + r * 0.85})`
