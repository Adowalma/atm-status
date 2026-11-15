import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kumbu } from '../lib/useKumbu';
import { ST, fmtD, near, summary } from '../lib/status';
import { useInView, usePageHidden, useReducedMotion } from '../lib/hooks';
import { StatusGlyph } from './ui';

/**
 * Hero scene: one ATM that walks through the four statuses, and glass status cards over its edges.
 * Only "tem kumbu" dispenses notes. The whole scene is decorative (aria-hidden); the real data lives in the ATM list below.
 */

const FLOW = ['tem', 'pouco', 'sem', 'fora'] as const;
type Flow = (typeof FLOW)[number];

/** How long each state stays on screen (ms). "tem" is longer so the notes can come out and be seen. */
const HOLD: Record<Flow, number> = { tem: 7600, pouco: 5200, sem: 5200, fora: 5200 };

const SCREEN: Record<Flow, { title: string; sub: string }> = {
  tem: { title: 'Retire as notas', sub: 'Obrigado. Volte sempre.' },
  pouco: { title: 'Poucas notas', sub: 'Levantamentos limitados.' },
  sem: { title: 'Sem notas disponíveis', sub: 'Dirija-se a outro Multicaixa.' },
  fora: { title: 'Fora de serviço', sub: 'Dirija-se a outro Multicaixa.' }
};

// A few discreet specks that drift gently upward, deterministic so the layout is stable between renders.
// The layer spans from 34em above the stage to its bottom (see .dust), so y is in em of that box.
const DUST = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  return { x: 2 + r(1) * 96, y: 4 + r(2) * 100, s: 1.2 + r(3) * 1.3, t: 22 + r(4) * 16, dl: -r(5) * 30, dx: (r(6) - .5) * 12, dy: 10 + r(8) * 8, a: .14 + r(7) * .16 };
});

const css = (v: Record<string, string | number>) => v as CSSProperties;

function Screen({ s, on }: { s: Flow; on: boolean }) {
  const { title, sub } = SCREEN[s];
  // The on-screen error uses a cross for "fora de serviço" too; the power glyph is reserved for the status card.
  const icon = s === 'tem' ? null : s === 'fora' ? 'x' : ST[s].icon;
  return (
    <div className={`lay lay-${s}`} data-on={on}>
      <div className="in row">
        <div className="lay-tx"><b className={s === 'tem' ? 'lay-h' : 'lay-t'}>{title}</b><span className="lay-p">{sub}</span></div>
        {icon && icon !== 'q' && <span className="lay-ic"><StatusGlyph icon={icon} stroke="currentColor" /></span>}
      </div>
      <i className="glare" />
    </div>
  );
}

export function AtmScene({ k }: { k: Kumbu }) {
  const [i, setI] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>();
  const hidden = usePageHidden();
  const reduce = useReducedMotion();
  const run = inView && !hidden && !reduce;
  const s = FLOW[i];

  // One timer per state: picking a state by hand simply restarts it.
  useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => setI(n => (n + 1) % FLOW.length), HOLD[s]);
    return () => clearTimeout(t);
  }, [i, run, s]);

  // Real data where we have it: the first ATM of the zone and the nearest one that has kumbu.
  const { where, alt, conf, closest } = useMemo(() => {
    const first = k.atms[0];
    const around = first ? near(k.atms, first.xy, first.id) : [];
    const best = around.find(x => x.status === 'tem');
    return {
      where: first ? `${first.bank} · ${first.name}` : 'BAI · Entrada',
      alt: best ? `${best.a.bank} a ${fmtD(best.d)} tem` : 'tenta outro ATM',
      conf: first ? Math.max(1, summary(first).conf) : 4,
      closest: best ? { where: `${best.a.bank} · ${best.a.name}`, d: fmtD(best.d).replace(' ', '') } : { where: 'Banco Sol · Rua 21', d: '300m' }
    };
  }, [k.atms]);

  const sub: Record<Flow, string> = { tem: `${where} · agora`, pouco: alt, sem: alt, fora: alt };
  const vars = css({ '--st-c': ST[s].color, '--st-led': s === 'fora' ? ST.sem.color : ST[s].color });

  return (
    <div ref={ref} className="scene" data-s={s} data-run={run} style={vars}>
      <div className="stage">
        <div className="halo" aria-hidden="true" />
        <div className="dust" aria-hidden="true">
          {DUST.map((d, n) => <i key={n} style={css({ '--x': `${d.x}%`, '--y': `${d.y}em`, '--s': `${d.s}px`, '--t': `${d.t}s`, '--dl': `${d.dl}s`, '--dx': `${d.dx}px`, '--dy': `-${d.dy}em`, '--a': d.a })} />)}
        </div>

        <div className="atm" aria-hidden="true">
          <div className="atm-sh" />
          <div className="atm-in">
            <div className="atm-top"><div className="atm-badge"><b>ATM</b></div></div>
            <div className="atm-body">
              <div className="scrframe">
                <div className="screen">{FLOW.map(f => <Screen key={f} s={f} on={f === s} />)}</div>
              </div>
              <div className="reader"><i className="led" /></div>
              <div className="disp">
                <div className="tray"><i className="slot" /></div>
              </div>
            </div>
          </div>
          {/* Outside .atm-in on purpose: that element fades out towards the bottom and would wash the notes out. */}
          <div className="chute">
            <div className="note nb" />
            <div className="note nf"><b>kumbu</b></div>
          </div>
        </div>

        {/* Glass cards laid over the machine's edges: the live status (left), then two supporting ones. */}
        <div className="fcw" aria-hidden="true">
          <div className="fc fc-n fc-b">
            <div className="fc-tx"><b>Confirmado por {conf} {conf === 1 ? 'vizinho' : 'vizinhos'}</b><span>na última hora</span></div>
            <span className="fc-chip">+{conf}</span>
          </div>
          <div className="fc fc-a">
            <div className="fc-tx">
              {FLOW.map(f => <div key={f} className="fc-v" data-on={f === s}><b>{ST[f].label}</b><span>{sub[f]}</span></div>)}
            </div>
            <span className="fc-ic">
              {FLOW.map(f => { const ic = ST[f].icon; return ic === 'q' ? null : <span key={f} className="g" data-on={f === s}><StatusGlyph icon={ic} /></span>; })}
            </span>
          </div>
          <div className="fc fc-n fc-c">
            <div className="fc-tx"><b>Mais perto com kumbu</b><span>{closest.where}</span></div>
            <span className="fc-chip mono">{closest.d}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
