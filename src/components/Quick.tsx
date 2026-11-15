import { useEffect, useRef, useState } from 'react';
import type { Kumbu } from '../lib/useKumbu';
import type { ReportReceipt, ReportStatus } from '../data/types';
import { ST, ago, atmLink, fmtD, near, reward, summary } from '../lib/status';
import { AtmSymbol, CloseIcon, Dot, Logo, PinIcon } from './ui';
import { useDialog } from '../lib/hooks';

interface Props {
  k: Kumbu; atmId: string; initialCaixa: number | 'all'; onClose: () => void; onOpenAtm: (id: string) => void; onAll: () => void;
  copied: string | null; copy: (t: string, key: string) => void; flash: (m: string) => void;
}

const OPTIONS: [ReportStatus, string][] = [['tem', 'Há notas, consegui levantar'], ['pouco', 'Só notas pequenas ou a acabar'], ['sem', 'Não sai dinheiro']];

export function Quick({ k, atmId, initialCaixa, onClose, onOpenAtm, onAll, copied, copy, flash }: Props) {
  const ref = useDialog(onClose);
  const [caixa, setCaixa] = useState<number | 'all'>(initialCaixa);
  const [sending, setSending] = useState<ReportStatus | null>(null);
  const [done, setDone] = useState<{ status: ReportStatus; targets: number[]; receipt: ReportReceipt } | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const a = k.atms.find(x => x.id === atmId);
  if (!a) return null;
  const multi = a.caixas.length > 1;
  const s = summary(a);

  const submit = async (status: ReportStatus) => {
    if (sending) return;
    setSending(status);
    const valid = caixa !== 'all' && a.caixas.some(c => c.n === caixa);
    const targets = valid ? [caixa as number] : a.caixas.map(c => c.n);
    try {
      const receipt = await k.report(a.id, targets, status);
      if (alive.current) setDone({ status, targets, receipt });
    } catch {
      flash('Não conseguimos enviar. Tenta de novo.');
    } finally {
      if (alive.current) setSending(null);
    }
  };
  const undo = async () => {
    if (!done) return;
    await k.undo(done.receipt);
    setDone(null);
    flash('Registo desfeito.');
  };

  const rw = reward(k.atms, a);
  const ckTxt = done && done.targets.length === 1 && multi ? `Caixa ${done.targets[0]}` : multi ? 'Todas as caixas' : '';

  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tkq" className="full">
      <div className="full-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
          <Logo size={18} />
          <div style={{ flex: 1 }} />
          <button className="icon-btn boxed zoom" onClick={onClose} aria-label="Fechar"><CloseIcon /></button>
        </div>

        {!done ? (
          <div className="up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="eyebrow">Estás no ATM</span>
              <h2 id="tkq" className="display" style={{ fontSize: 'clamp(32px,8vw,40px)', letterSpacing: '-.03em', lineHeight: 1.02 }}>{a.bank} · {a.name}</h2>
              <span className="muted" style={{ fontSize: 15 }}>{a.local}</span>
              <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, paddingTop: 4 }}>
                <Dot status={s.status} />{s.status === 'unknown' ? 'Ainda sem registos aqui' : `Último registo: ${ST[s.status].label.toLowerCase()} · ${ago(s.ago)}`}
              </span>
            </div>
            {multi && (
              <div role="group" aria-label="Caixa" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {([['all', 'Todas'], ...a.caixas.map(c => [c.n, `Caixa ${c.n}`])] as [number | 'all', string][]).map(([v, label]) => (
                  <button key={String(v)} className="filter" style={{ height: 44, padding: '0 16px' }} aria-pressed={caixa === v} onClick={() => setCaixa(v)}>{label}</button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>O que vês agora?</span>
              {OPTIONS.map(([st, sub]) => (
                <button key={st} className="opt zoom zoom-sm" disabled={!!sending} aria-busy={sending === st}
                  style={{ opacity: sending && sending !== st ? .45 : 1 }} onClick={() => void submit(st)}>
                  <AtmSymbol status={st} px={6} />
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <b style={{ fontWeight: 600, fontSize: 18 }}>{ST[st].label}</b>
                    <span className="muted" style={{ fontSize: 14, lineHeight: 1.35 }}>{sending === st ? 'A enviar…' : sub}</span>
                  </span>
                  {sending === st && <span aria-hidden="true" className="spin" />}
                </button>
              ))}
              <button className="link-btn muted" disabled={!!sending} onClick={() => void submit('fora')}>O ATM está desligado / fora de serviço</button>
            </div>
            <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>Sem conta e sem formulário — o toque já envia. Podes desfazer a seguir.</span>
          </div>
        ) : (
          <div className="up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <AtmSymbol status={done.status} px={7} slit="var(--bg)" />
              <div role="status" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 id="tkq" className="display" style={{ fontSize: 'clamp(28px,7vw,36px)', letterSpacing: '-.03em', lineHeight: 1.05 }}>{done.receipt.queued ? 'Guardado. Obrigado!' : 'Registado. Obrigado!'}</h2>
                <span className="muted" style={{ fontSize: 15, lineHeight: 1.4 }}>{[`${a.bank} ${a.name}`, ckTxt, ST[done.status].label.toLowerCase()].filter(Boolean).join(' · ')}</span>
                {done.receipt.queued && <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, paddingTop: 2 }}><Dot color="#E8A53A" />Sem rede — enviamos assim que voltar.</span>}
              </div>
            </div>
            <button className="link-btn" style={{ marginTop: -14, fontSize: 15, color: 'var(--accent-ink)' }} onClick={() => void undo()}>Enganei-me, desfazer</button>

            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="mono eyebrow" style={{ fontSize: 12, letterSpacing: '.1em' }}>Aqui perto</span>
              <p style={{ fontSize: 'clamp(19px,5vw,22px)', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-.01em', textWrap: 'pretty' }}>{rw.text}</p>
              {rw.has && <a className="btn btn-primary zoom" style={{ alignSelf: 'flex-start' }} href={rw.maps} target="_blank" rel="noopener"><PinIcon />Como chegar</a>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="mono muted" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', paddingBottom: 4 }}>Outros ATMs perto</span>
              {near(k.atms, a.xy, a.id).slice(0, 4).map(n => (
                <button key={n.a.id} className="row-card" onClick={() => onOpenAtm(n.a.id)}>
                  <Dot status={n.status} />
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <b style={{ fontWeight: 600, fontSize: 15 }}>{n.a.bank} · {n.a.name}</b>
                    <span className="muted" style={{ fontSize: 13 }}>{n.status === 'unknown' ? 'Sem informação' : `${ST[n.status].label} · ${ago(n.ago)}`}</span>
                  </span>
                  <span className="mono muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtD(n.d)}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="mono muted" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>Avisa os vizinhos</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <a className="btn btn-ink zoom" style={{ height: 48, fontWeight: 600 }} target="_blank" rel="noopener"
                  href={'https://wa.me/?text=' + encodeURIComponent(`${a.bank} ${a.name}: ${ST[done.status].label.toLowerCase()} agora. Vê os outros ATMs do Sequele: ${atmLink(a.id, 'wa')}`)}>WhatsApp</a>
                <button className="btn btn-ghost zoom" style={{ height: 48 }} onClick={() => copy(atmLink(a.id, 'wa'), 'q')}>{copied === 'q' ? 'Copiado ✓' : 'Copiar link'}</button>
              </div>
            </div>
            <button className="btn" style={{ height: 48, background: 'transparent', color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={onAll}>Ver todos os ATMs</button>
          </div>
        )}
      </div>
    </div>
  );
}
