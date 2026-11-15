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

export default function App() {
  const url = useMemo(readUrl, []);
  const k = useKumbu(url.demo);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pre, setPre] = useState<'on' | 'fading' | 'off'>('on');
  const { toast, flash } = useToast();
  const { copied, copy } = useCopy(flash);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

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
  const closeQuick = useCallback(() => {
    setSheet(null);
    if (/\/atm\//i.test(location.pathname)) history.replaceState(null, '', '/' + location.search.replace(/[?&](src|c)=[^&]*/g, '').replace(/^&/, '?'));
  }, []);
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

      {sheet?.kind === 'detail' && (
        <Detail k={k} atmId={sheet.id} onClose={() => setSheet(null)} copied={copied} copy={copy} flash={flash} rewardText={rewardText}
          onUpdate={c => setSheet({ kind: 'quick', id: sheet.id, caixa: c ?? 'all' })} />
      )}
      {sheet?.kind === 'pick' && <Pick k={k} onClose={() => setSheet(null)} onPick={id => setSheet({ kind: 'quick', id, caixa: 'all' })} />}
      {sheet?.kind === 'quick' && (
        <Quick key={sheet.id + String(sheet.caixa)} k={k} atmId={sheet.id} initialCaixa={sheet.caixa} onClose={closeQuick} copied={copied} copy={copy} flash={flash}
          onOpenAtm={id => { closeQuick(); setSheet({ kind: 'detail', id }); }}
          onAll={() => { closeQuick(); setTimeout(() => { const el = document.getElementById('atms'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' }); }, 60); }} />
      )}
      {pre !== 'off' && <Preloader fading={pre === 'fading'} />}
      <Toast text={toast} />
    </div>
  );
}
