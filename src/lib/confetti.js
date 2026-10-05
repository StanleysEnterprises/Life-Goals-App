import { CONFETTI } from './theme'

const SIZES = {
  // every tick: a small sprinkle
  mini: { count: 12, size: [5, 4], dist: [22, 38], duration: [700, 300], fall: 30 },
  // last habit of the day, weekly target hit, milestone done
  big: { count: 40, size: [7, 6], dist: [60, 110], duration: [1300, 700], fall: 80 },
}

// A dependency-free confetti burst from a point on screen.
export function burst(x, y, kind = 'big') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const cfg = SIZES[kind] ?? SIZES.big

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:60;overflow:hidden'
  document.body.appendChild(layer)

  let longest = 0
  for (let i = 0; i < cfg.count; i++) {
    const piece = document.createElement('span')
    const w = cfg.size[0] + Math.random() * cfg.size[1]
    const round = Math.random() < 0.4
    const h = round ? w : w * 0.55
    // Centre the piece on the point with plain pixel offsets (no calc() — friendlier to iOS Safari)
    piece.style.cssText = `position:absolute;display:block;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;background:${
      CONFETTI[i % CONFETTI.length]
    };border-radius:${round ? '50%' : '2px'};will-change:transform,opacity`
    layer.appendChild(piece)

    // Fan upwards, then drift down with a little spin
    const angle = ((-90 + (Math.random() * 160 - 80)) * Math.PI) / 180
    const dist = cfg.dist[0] + Math.random() * cfg.dist[1]
    const dx = Math.round(Math.cos(angle) * dist)
    const dy = Math.round(Math.sin(angle) * dist)
    const spin = Math.round(Math.random() * 540 - 270)
    const duration = cfg.duration[0] + Math.random() * cfg.duration[1]
    longest = Math.max(longest, duration)

    const frames = [
      { transform: 'translate(0px, 0px) scale(0.3) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: `translate(${dx}px, ${dy}px) scale(1) rotate(${Math.round(spin * 0.6)}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${Math.round(dx * 1.12)}px, ${dy + Math.round(cfg.fall * 0.5)}px) scale(0.95) rotate(${Math.round(spin * 0.8)}deg)`, opacity: 1, offset: 0.7 },
      { transform: `translate(${Math.round(dx * 1.25)}px, ${dy + cfg.fall}px) scale(0.85) rotate(${spin}deg)`, opacity: 0, offset: 1 },
    ]

    if (typeof piece.animate === 'function') {
      piece.animate(frames, { duration, easing: 'cubic-bezier(.15,.75,.35,1)', fill: 'forwards' })
    } else {
      // Very old browsers: a simple CSS transition fallback
      piece.style.transition = `transform ${duration}ms cubic-bezier(.15,.75,.35,1), opacity ${duration}ms ease-in`
      requestAnimationFrame(() => {
        piece.style.transform = frames[3].transform
        piece.style.opacity = '0'
      })
    }
  }

  setTimeout(() => layer.remove(), longest + 150)
}
