import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AtmList } from './components/AtmList';
import { How, Footer } from './components/HowFooter';
import { Detail } from './components/Detail';
import { Pick } from './components/Pick';
import { Quick } from './components/Quick';
import { Preloader, Toast } from './components/Chrome';
import { readUrl, useCopy, useToast } from './lib/hooks';
import { useKumbu } from './lib/useKumbu';
import { reward } from './lib/status';

type Sheet = { kind: 'detail'; id: string } | { kind: 'pick' } | { kind: 'quick'; id: string; caixa: number | 'all' } | null;

const EXIT_MS = 220; // keep in sync with the .leaving animations in styles.css

export default function App() {
  const url = useMemo(readUrl, []);
  const k = useKumbu(url.demo);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark');
  const [sheet, setSheet] = useState<Sheet>(null);
  // `sheet` is the target; `view` is what is actually mounted. When the target changes, the mounted
  // dialog plays its exit animation first, then the next one enters — so dialogs never overlap.
  const [view, setView] = useState<Sheet>(null);
  const [leaving, setLeaving] = useState(false);
  const [pre, setPre] = useState<'on' | 'fading' | 'off'>('on');
  const { toast, flash } = useToast();
  const { copied, copy } = useCopy(flash);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    if (view === sheet) { setLeaving(false); return; }
    if (!view) { setView(sheet); return; }
    setLeaving(true);
    const t = setTimeout(() => { setLeaving(false); setView(sheet); }, EXIT_MS);
    return () => clearTimeout(t);
  }, [sheet, view]);

  // Preloader fades out as soon as data settles (or immediately for demo states).
  useEffect(() => {
    if (pre !== 'on' || (k.phase === 'loading' && url.demo !== 'loading')) return;
    setPre('fading');
    const t = setTimeout(() => setPre('off'), 600);
    return () => clearTimeout(t);
  }, [k.phase, pre, url.demo]);

  // Deep link: /atm/<id>?src=qr&c=2 opens that ATM's report screen directly (no list, no form).
  useEffect(() => {
    if (url.atm && (k.phase === 'ready' || url.demo === 'loading')) {
      if (k.atms.some(a => a.id === url.atm)) setSheet({ kind: 'quick', id: url.atm, caixa: url.caixa });
    }
    // only once, when data first becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k.phase === 'ready']);

  const toggleTheme = () => setTheme(t => { const n = t === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tk-theme', n); } catch { /* ignore */ } return n; });
  const cleanUrl = useCallback(() => {
    if (/\/atm\//i.test(location.pathname)) history.replaceState(null, '', '/' + location.search.replace(/[?&](src|c)=[^&]*/g, '').replace(/^&/, '?'));
  }, []);
  const closeQuick = useCallback(() => { setSheet(null); cleanUrl(); }, [cleanUrl]);
  const rewardText = useCallback((id: string) => {
    const a = k.atms.find(x => x.id === id);
    return a ? reward(k.atms, a) : { has: false, text: '' };
  }, [k.atms]);

  return (
    <div className="page" id="topo">
      <Header theme={theme} onToggle={toggleTheme} onPick={() => setSheet({ kind: 'pick' })} />
      <main className="wrap">
        <Hero k={k} onPick={() => setSheet({ kind: 'pick' })} />
        <AtmList k={k} onOpen={id => setSheet({ kind: 'detail', id })} onPick={() => setSheet({ kind: 'pick' })} />
        <How />
      </main>
      <Footer />

      <div className={leaving ? 'leaving' : undefined} style={{ display: 'contents' }}>
        {view?.kind === 'detail' && (
          <Detail k={k} atmId={view.id} onClose={() => setSheet(null)} copied={copied} copy={copy} flash={flash} rewardText={rewardText}
            onUpdate={c => setSheet({ kind: 'quick', id: view.id, caixa: c ?? 'all' })} />
        )}
        {view?.kind === 'pick' && <Pick k={k} onClose={() => setSheet(null)} onPick={id => setSheet({ kind: 'quick', id, caixa: 'all' })} />}
        {view?.kind === 'quick' && (
          <Quick key={view.id + String(view.caixa)} k={k} atmId={view.id} initialCaixa={view.caixa} onClose={closeQuick} copied={copied} copy={copy} flash={flash}
            onOpenAtm={id => { cleanUrl(); setSheet({ kind: 'detail', id }); }}
            onAll={() => { closeQuick(); setTimeout(() => { const el = document.getElementById('atms'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' }); }, 60); }} />
        )}
      </div>
      {pre !== 'off' && <Preloader fading={pre === 'fading'} />}
      <Toast text={toast} />
    </div>
  );
}
