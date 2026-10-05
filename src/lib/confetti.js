import { CONFETTI } from './theme'

// A tiny, dependency-free confetti burst from a point on screen.
export function burst(x, y, { count = 40 } = {}) {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden'
  document.body.appendChild(layer)

  let longest = 0
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    const size = 7 + Math.random() * 6
    const round = Math.random() < 0.4
    piece.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${
      round ? size : size * 0.55
    }px;background:${CONFETTI[i % CONFETTI.length]};border-radius:${round ? '50%' : '2px'};will-change:transform,opacity`
    layer.appendChild(piece)

    // Fan upwards, then drift down with a little spin
    const angle = ((-90 + (Math.random() * 160 - 80)) * Math.PI) / 180
    const dist = 60 + Math.random() * 110
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist
    const spin = Math.random() * 540 - 270
    const duration = 1300 + Math.random() * 700
    longest = Math.max(longest, duration)

    piece.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.4 },
        { opacity: 1, offset: 0.75 },
        { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 80}px)) scale(.85) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration, easing: 'cubic-bezier(.15,.75,.35,1)', fill: 'forwards' },
    )
  }

  setTimeout(() => layer.remove(), longest + 120)
}
