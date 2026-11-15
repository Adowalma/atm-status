export function Preloader({ fading }: { fading: boolean }) {
  return (
    <div role="status" aria-label="A carregar tem kumbu" className="pre" style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto' }}>
      <div aria-hidden="true" style={{ position: 'relative', width: 132, height: 40, borderRadius: 10, background: 'var(--ink)' }}>
        <div style={{ position: 'absolute', left: 12, right: 12, top: 15, height: 10, borderRadius: 5, background: 'var(--dust)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'var(--bg)', animation: 'tkClean 1.3s cubic-bezier(.45,.05,.35,1) infinite' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 46, borderRadius: 5, background: 'linear-gradient(90deg,rgba(255,255,255,0),#ffffff 60%,#eaffef)', boxShadow: '0 0 14px 3px rgba(140,240,170,.45)', animation: 'tkGlint 1.3s cubic-bezier(.45,.05,.35,1) infinite' }} />
        </div>
      </div>
      <span className="mono muted" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>A ver os ATMs…</span>
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  return (
    <div aria-live="polite" style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 80, width: 'max-content', maxWidth: 'calc(100% - 32px)' }}>
      {text && <div className="toast">{text}</div>}
    </div>
  );
}
