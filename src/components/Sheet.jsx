// A bottom sheet that slides up over the app.
export default function Sheet({ open, onClose, onSubmit, title, children }) {
  const Panel = onSubmit ? 'form' : 'div'
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-shade/30 backdrop-blur-[2px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <Panel
        onSubmit={onSubmit}
        role="dialog"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] max-w-md overflow-y-auto rounded-t-[32px] border-t border-line bg-canvas px-5 pt-3 pb-safe shadow-soft transition-transform duration-500 ease-calm ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" />
        {title && <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>}
        {children}
      </Panel>
    </div>
  )
}

export function SheetRow({ label, children, scroll = true }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      <div className={scroll ? '-mx-5 flex gap-2 overflow-x-auto px-5 pb-1' : ''}>{children}</div>
    </div>
  )
}
