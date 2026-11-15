import { useEffect, useState } from 'react';
import { Logo } from './ui';

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
);
const MenuIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="burger" data-open={open}>
    <path className="b1" d="M4 7h16" /><path className="b2" d="M4 12h16" /><path className="b3" d="M4 17h16" />
  </svg>
);

export function Header({ theme, onToggle, onPick }: { theme: 'dark' | 'light'; onToggle: () => void; onPick: () => void }) {
  const [open, setOpen] = useState(false);
  const dark = theme === 'dark';
  const themeLabel = dark ? 'Mudar para tema claro' : 'Mudar para tema escuro';

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // The menu only exists on small screens: if the viewport grows past that, drop it.
    const mq = matchMedia('(min-width: 641px)');
    const grow = () => { if (mq.matches) setOpen(false); };
    addEventListener('keydown', key);
    mq.addEventListener('change', grow);
    return () => { removeEventListener('keydown', key); mq.removeEventListener('change', grow); };
  }, [open]);

  const pick = () => { setOpen(false); onPick(); };

  return (
    <header className="hdr">
      <div className="hdr-in">
        <a href="#topo" className="hdr-logo" aria-label="tem kumbu? — início" onClick={() => setOpen(false)}><Logo /></a>
        <span className="chip hdr-zone">Sequele</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn zoom hdr-theme" onClick={onToggle} aria-label={themeLabel}>{dark ? <SunIcon /> : <MoonIcon />}</button>
        <button className="btn btn-outline zoom hdr-cta" onClick={pick}>Estou num ATM</button>
        <button className="icon-btn boxed zoom hdr-burger" aria-expanded={open} aria-controls="hdr-menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(o => !o)}>
          <MenuIcon open={open} />
        </button>
      </div>

      <div className="hdr-scrim" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
      <nav id="hdr-menu" className="hdr-menu" data-open={open} aria-label="Menu">
        <div className="hdr-menu-in">
          <span className="menu-item menu-zone"><span className="muted">Zona</span><b>Sequele</b></span>
          <a className="menu-item" href="#atms" onClick={() => setOpen(false)}>Ver ATMs</a>
          <a className="menu-item" href="#como" onClick={() => setOpen(false)}>Como funciona</a>
          <button type="button" className="menu-item" onClick={onToggle}>
            <span>{dark ? 'Tema claro' : 'Tema escuro'}</span>{dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" className="btn btn-primary btn-lg zoom menu-cta" onClick={pick}>Estou num ATM</button>
        </div>
      </nav>
    </header>
  );
}
