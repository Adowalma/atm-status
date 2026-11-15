import type { Kumbu } from '../lib/useKumbu';
import { summary } from '../lib/status';
import { AtmSymbol, Reveal, Skel } from './ui';

const LEGEND = [['unknown', 'Por confirmar'], ['tem', 'Tem kumbu'], ['pouco', 'Pouco kumbu'], ['sem', 'Sem kumbu']] as const;

export function Hero({ k, onPick }: { k: Kumbu; onPick: () => void }) {
  const sums = k.atms.map(summary);
  const loading = k.phase === 'loading';
  return (
    <Reveal as="section" className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Estado dos ATMs · feito pelos vizinhos</span>
        <h1>Antes de ir à fila, pergunta à vizinhança.</h1>
        <p>Lê o QR colado no ATM e diz, num toque, se tem kumbu. Em troca, vês logo como estão os outros ATMs aqui perto.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 6 }}>
          <button className="btn btn-lg btn-primary zoom" onClick={onPick}>Estou num ATM</button>
          <a href="#atms" className="btn btn-lg btn-ghost zoom">Ver ATMs</a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, paddingTop: 16 }}>
          {loading ? [150, 120].map(w => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}><Skel w={76} h={28} r={4} /><Skel w={w} h={12} /></div>
          )) : (
            <>
              <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <b>{sums.filter(s => s.status === 'tem').length}<span className="muted" style={{ fontSize: 20 }}> / {sums.length}</span></b>
                <span className="muted" style={{ fontSize: 14 }}>ATMs com kumbu agora</span>
              </div>
              <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <b>{sums.reduce((n, s) => n + s.conf, 0)}</b>
                <span className="muted" style={{ fontSize: 14 }}>confirmações hoje</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="card hero-card">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}><AtmSymbol status="tem" px={22} /></div>
        <div className="legend">
          {LEGEND.map(([s, label]) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}><AtmSymbol status={s} px={4} /><span style={{ fontSize: 14, lineHeight: 1.3 }}>{label}</span></div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
