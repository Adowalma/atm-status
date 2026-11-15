import { Logo } from './ui';

export function Header({ theme, onToggle, onPick }: { theme: 'dark' | 'light'; onToggle: () => void; onPick: () => void }) {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <a href="#topo" aria-label="tem kumbu? — início" style={{ display: 'flex', textDecoration: 'none' }}><Logo /></a>
        <span className="chip">Sequele</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn zoom" onClick={onToggle} aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
          {theme === 'dark'
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>}
        </button>
        <button className="btn btn-outline zoom" onClick={onPick}>Estou num ATM</button>
      </div>
    </header>
  );
}
