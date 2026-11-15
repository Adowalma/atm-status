import { useState } from 'react';
import type { Kumbu } from '../lib/useKumbu';
import type { StatusKey } from '../data/types';
import { ST, ago, summary } from '../lib/status';
import { AtmSymbol, Dot, Reveal, Skel } from './ui';

type Filter = 'all' | StatusKey;
const FILTERS: [Filter, string, string][] = [['all', 'Todos', 'var(--muted)'], ['tem', 'Tem', ST.tem.color], ['pouco', 'Pouco', ST.pouco.color], ['sem', 'Sem', ST.sem.color], ['fora', 'Fora', ST.fora.color]];

const Shimmer = () => <span className="sk" style={{ width: 52, height: 34, borderRadius: 4, flex: 'none', marginTop: 4 }} />;

export function AtmList({ k, onOpen, onPick }: { k: Kumbu; onOpen: (id: string) => void; onPick: () => void }) {
  const [tab, setTab] = useState<'atms' | 'feed'>('atms');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const loading = k.phase === 'loading', err = k.phase === 'error', ready = k.phase === 'ready';
  const sums = k.atms.map(a => ({ a, ...summary(a) }));
  const qy = query.trim().toLowerCase();
  const list = sums.filter(x => (filter === 'all' || x.status === filter) && (!qy || `${x.a.bank} ${x.a.name} ${x.a.local}`.toLowerCase().includes(qy)));
  const allUnknown = ready && sums.every(x => x.status === 'unknown');
  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    <Reveal as="section" id="atms" className="section">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="eyebrow">Agora no Sequele</span>
          <h2 className="h2">ATMs</h2>
        </div>
        <div role="tablist" className="tabs">
          {([['atms', 'Lista'], ['feed', 'Atividade']] as const).map(([t, label]) => (
            <button key={t} role="tab" className="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'atms' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} aria-label="Procurar banco ou local" placeholder="Procurar banco ou local" autoComplete="off" />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Limpar pesquisa" className="icon-btn" style={{ width: 40, height: 40, borderRadius: 4, color: 'var(--muted)', animation: 'tkFade .25s ease' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              )}
            </label>
            <div className="filters">
              {FILTERS.map(([f, label, dot]) => (
                <button key={f} className="filter zoom" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  <Dot color={dot} />{label}<span style={{ opacity: .75 }}>{sums.filter(x => f === 'all' || x.status === f).length}</span>
                </button>
              ))}
            </div>
          </div>

          {ready && k.offline && (
            <div role="status" className="alert warn up">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A53A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0" /><circle cx="12" cy="19" r="1" /><path d="M3 3l18 18" /></svg>
              <span><b style={{ fontWeight: 600 }}>Sem rede.</b> A mostrar o último estado conhecido. Os teus registos ficam guardados e seguem quando a rede voltar.</span>
            </div>
          )}

          {loading && (
            <>
              <div aria-busy="true" aria-label="A carregar ATMs" className="grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="card" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: 120 }}>
                    <Shimmer />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 4 }}><Skel w="58%" h={14} /><Skel w="82%" h={10} /><Skel w="44%" h={10} /></div>
                  </div>
                ))}
              </div>
              <span role="status" className="sr">A carregar o estado dos ATMs…</span>
            </>
          )}

          {err && (
            <div role="alert" className="card up" style={{ padding: 'clamp(24px,5vw,36px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(226,88,63,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E2583F" strokeWidth="2.2" strokeLinecap="round"><path d="M12 7v6" /><circle cx="12" cy="17" r="1" /><circle cx="12" cy="12" r="9.5" /></svg>
              </span>
              <b style={{ fontWeight: 600, fontSize: 19 }}>Não conseguimos carregar os ATMs</b>
              <span className="muted" style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 460 }}>Pode ser a rede ou o servidor. Tenta de novo daqui a pouco.</span>
              <button className="btn btn-primary zoom" onClick={() => void k.load()}>Tentar de novo</button>
            </div>
          )}

          {allUnknown && (
            <div className="card pad-card up">
              <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <b style={{ fontWeight: 600, fontSize: 18 }}>Ainda ninguém registou hoje</b>
                <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>Os ATMs ficam “sem informação” até alguém passar. O primeiro registo ajuda o bairro todo.</span>
              </div>
              <button className="btn btn-primary zoom" onClick={onPick}>Estou num ATM</button>
            </div>
          )}

          {ready && list.length > 0 && (
            <div className="grid">
              {list.map(({ a, status, ago: ag, conf }, i) => {
                const okN = a.caixas.filter(c => c.status === 'tem').length;
                return (
                  <button key={a.id} className="card atm-card" style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }} onClick={() => onOpen(a.id)}>
                    <div style={{ marginTop: 4 }}><AtmSymbol status={status} px={5.4} /></div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <b style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>{a.bank} · {a.name}</b>
                      <span className="muted" style={{ fontSize: 14, lineHeight: 1.35 }}>{a.local}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, fontSize: 14, fontWeight: 500 }}>
                        <Dot status={status} />{ST[status].label}
                        <span className="muted" style={{ fontWeight: 400 }}>· {a.caixas.length === 1 ? '1 caixa' : `${okN} de ${a.caixas.length} caixas com kumbu`}</span>
                      </div>
                      <span className="muted" style={{ fontSize: 13 }}>
                        {status === 'unknown' ? 'Ninguém registou ainda' : `${conf} confirmações · ${ago(ag)}${ag != null && ag > 120 ? ' · pode estar desatualizado' : ''}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {ready && !list.length && (
            <div className="center">
              <b style={{ fontWeight: 600, fontSize: 17 }}>Nenhum ATM encontrado</b>
              <span className="muted" style={{ fontSize: 14 }}>{qy ? `Nada para “${query.trim()}”${filter !== 'all' ? ' com este filtro' : ''}.` : 'Nenhum ATM com este estado agora.'}</span>
              <button className="btn btn-ghost zoom" onClick={clearAll} style={{ marginTop: 4 }}>Limpar pesquisa e filtros</button>
            </div>
          )}
        </>
      )}

      {tab === 'feed' && <Feed k={k} onOpen={onOpen} />}
    </Reveal>
  );
}

function Feed({ k, onOpen }: { k: Kumbu; onOpen: (id: string) => void }) {
  if (k.phase === 'loading') return (
    <div aria-busy="true" aria-label="A carregar atividade" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="row-card" style={{ pointerEvents: 'none' }}>
          <Skel w={38} h={25} r={3} style={{ flex: 'none' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}><Skel w="66%" h={12} /><Skel w="38%" h={10} /></div>
        </div>
      ))}
    </div>
  );
  if (k.phase === 'error') return (
    <div role="alert" className="card pad-card up">
      <span style={{ flex: '1 1 220px', fontSize: 15, lineHeight: 1.5 }}>Não conseguimos carregar a atividade.</span>
      <button className="btn btn-primary zoom" onClick={() => void k.load()}>Tentar de novo</button>
    </div>
  );
  if (!k.log.length) return (
    <div className="center"><b style={{ fontWeight: 600, fontSize: 17 }}>Ainda sem atividade hoje</b><span className="muted" style={{ fontSize: 14 }}>Os registos dos vizinhos aparecem aqui, do mais recente para o mais antigo.</span></div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {k.log.slice(0, 20).map((e, i) => {
        const a = k.atms.find(x => x.id === e.atm);
        if (!a) return null;
        return (
          <button key={i} className="row-card" style={{ transitionDuration: '.3s' }} onClick={() => onOpen(e.atm)}>
            <AtmSymbol status={e.status} px={4} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 15, lineHeight: 1.35 }}><b style={{ fontWeight: 600 }}>{e.who}</b> {e.type === 'confirm' ? 'confirmou' : 'marcou'} <b style={{ fontWeight: 600 }}>{ST[e.status].label.toLowerCase()}</b></span>
              <span className="muted" style={{ fontSize: 13 }}>{a.bank} · {a.name} · Caixa {e.caixa}</span>
            </div>
            <span className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{ago(e.ago)}</span>
          </button>
        );
      })}
    </div>
  );
}
