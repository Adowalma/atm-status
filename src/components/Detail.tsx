import { useState } from 'react';
import type { Kumbu } from '../lib/useKumbu';
import { ST, ago, atmLink, mapsUrl, summary } from '../lib/status';
import { AtmSymbol, CloseIcon, Dot, PinIcon, Sheet } from './ui';

interface Props {
  k: Kumbu; atmId: string; onClose: () => void; onUpdate: (caixa?: number) => void;
  copied: string | null; copy: (t: string, key: string) => void; flash: (m: string) => void; rewardText: (id: string) => { has: boolean; text: string };
}

export function Detail({ k, atmId, onClose, onUpdate, copied, copy, flash, rewardText }: Props) {
  const a = k.atms.find(x => x.id === atmId);
  const [showQr, setShowQr] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});
  if (!a) return null;
  const ds = summary(a);
  const link = atmLink(a.id, 'qr');
  const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=' + encodeURIComponent(link);
  const wa = 'https://wa.me/?text=' + encodeURIComponent(`${a.bank} ${a.name}: ${ST[ds.status].label.toLowerCase()} (${ago(ds.ago)}). Vê e atualiza: ${atmLink(a.id, 'wa')}`);
  const feed = k.log.filter(e => e.atm === a.id);

  const confirm = async (n: number) => {
    setConfirmed(c => ({ ...c, [n]: true }));
    await k.confirm(a.id, n);
    const r = rewardText(a.id);
    flash(r.has ? `Confirmado. ${r.text}` : 'Confirmado. Obrigado!');
  };

  return (
    <Sheet labelledBy="tkd" onClose={onClose} maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="mono muted" style={{ fontSize: 13, letterSpacing: '.04em' }}>{a.bank}</span>
          <h3 id="tkd" className="display" style={{ fontSize: 30, letterSpacing: '-.025em', lineHeight: 1.05 }}>{a.name}</h3>
          <span className="muted" style={{ fontSize: 15 }}>{a.local}</span>
        </div>
        <button className="icon-btn boxed zoom" onClick={onClose} aria-label="Fechar"><CloseIcon /></button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-primary zoom" onClick={() => onUpdate()}>Atualizar estado</button>
        <a className="btn btn-ghost zoom" href={mapsUrl(a)} target="_blank" rel="noopener"><PinIcon />Como chegar</a>
        <button className="btn btn-ghost zoom" aria-expanded={showQr} onClick={() => setShowQr(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" /></svg>QR e link
        </button>
      </div>

      {showQr && (
        <div className="card up" style={{ padding: 18, display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
          <div className="qr">
            {!qrLoaded && <div aria-hidden="true" className="sk" style={{ position: 'absolute', inset: 10, borderRadius: 2, ['--skel' as string]: '#ececec', ['--skel2' as string]: '#f7f7f7' }} />}
            <img key={a.id} src={qrSrc} alt={`Código QR para ${a.bank} ${a.name}`} width={148} height={148} loading="lazy" decoding="async"
              onLoad={() => setQrLoaded(true)} onError={() => setQrLoaded(true)}
              style={{ position: 'relative', display: 'block', width: 148, height: 148, padding: 10, opacity: qrLoaded ? 1 : 0, transition: 'opacity .5s ease' }} />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="muted" style={{ fontSize: 14, lineHeight: 1.45, textWrap: 'pretty' }}>Um QR por ATM. Cola-o junto à máquina: quem lê, reporta num toque.</span>
            <code className="mono" style={{ fontSize: 13, wordBreak: 'break-all' }}>{link}</code>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className="btn btn-ink zoom" onClick={() => copy(link, 'd')}>{copied === 'd' ? 'Copiado ✓' : 'Copiar link'}</button>
              <a className="btn btn-soft zoom" href={wa} target="_blank" rel="noopener">Enviar no WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {a.caixas.map(c => {
          const done = !!confirmed[c.n], unk = c.status === 'unknown', tot = c.conf + c.disp;
          const votes = unk ? 'sem votos' : `${c.conf} confirmam${c.disp ? ` · ${c.disp} discorda${c.disp > 1 ? 'm' : ''}` : ''}`;
          return (
            <div key={c.n} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <AtmSymbol status={c.status} px={5.4} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="muted" style={{ fontSize: 13 }}>Caixa {c.n}</span>
                  <b style={{ fontWeight: 600, fontSize: 18 }}>{ST[c.status].label}</b>
                  <span className="muted" style={{ fontSize: 13 }}>{unk ? 'Sem registos' : `Última confirmação ${ago(c.ago)}`}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div role="img" aria-label={votes} className="bar-track"><div style={{ width: tot ? `${Math.round(c.conf / tot * 100)}%` : '0%', background: ST[c.status].dot, transition: 'width .5s cubic-bezier(.2,.7,.2,1)' }} /></div>
                <span className="muted" style={{ whiteSpace: 'nowrap' }}>{votes}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="btn zoom" disabled={done || unk} onClick={() => void confirm(c.n)}
                  style={{ height: 46, background: done ? '#44B864' : 'var(--ink)', color: done ? '#111' : 'var(--bg)', opacity: unk ? .4 : 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="5,12.5 10,17.5 19,7" /></svg>{done ? 'Confirmado' : 'Confirmo'}
                </button>
                <button className="btn btn-soft zoom" style={{ height: 46 }} onClick={() => onUpdate(c.n)}>Está diferente</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="mono muted" style={{ fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', paddingBottom: 6 }}>Histórico</span>
        {feed.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', fontSize: 14 }}>
            <Dot status={e.status} />
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}><b style={{ fontWeight: 600 }}>{e.who}</b> {e.type === 'confirm' ? 'confirmou' : 'marcou'} {ST[e.status].label.toLowerCase()} · Caixa {e.caixa}</span>
            <span className="muted" style={{ whiteSpace: 'nowrap' }}>{ago(e.ago)}</span>
          </div>
        ))}
        {!feed.length && <span className="muted" style={{ fontSize: 14, padding: '8px 0' }}>Ainda ninguém registou este ATM. Sê o primeiro.</span>}
      </div>
    </Sheet>
  );
}
