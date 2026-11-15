import type { Atm, StatusKey } from '../data/types';

export const ST: Record<StatusKey, { label: string; color: string; dot: string; icon: 'check' | 'dash' | 'x' | 'power' | 'q' }> = {
  tem: { label: 'Tem kumbu', color: '#44B864', dot: '#44B864', icon: 'check' },
  pouco: { label: 'Pouco kumbu', color: '#E8A53A', dot: '#E8A53A', icon: 'dash' },
  sem: { label: 'Sem kumbu', color: '#E2583F', dot: '#E2583F', icon: 'x' },
  fora: { label: 'Fora de serviço', color: '#8E8E8E', dot: '#8E8E8E', icon: 'power' },
  unknown: { label: 'Sem informação', color: 'var(--surface2)', dot: 'var(--muted)', icon: 'q' }
};

export const RANK: StatusKey[] = ['tem', 'pouco', 'sem', 'fora', 'unknown'];

export interface Summary { status: StatusKey; ago: number | null; conf: number }

export function summary(a: Atm): Summary {
  const best = RANK.find(k => a.caixas.some(c => c.status === k)) ?? 'unknown';
  const agos = a.caixas.filter(c => c.status === best).map(c => c.ago).filter((x): x is number => x != null);
  return { status: best, ago: agos.length ? Math.min(...agos) : null, conf: a.caixas.reduce((s, c) => s + c.conf, 0) };
}

export function near(atms: Atm[], xy: [number, number], exclude: string | null) {
  return atms
    .filter(a => a.id !== exclude)
    .map(a => ({ a, d: Math.hypot(a.xy[0] - xy[0], a.xy[1] - xy[1]), ...summary(a) }))
    .sort((x, y) => x.d - y.d);
}

export const BASE = 'https://temkumbu.ao/atm/';
export const atmLink = (id: string, src: string) => `${BASE}${id}?src=${src}`;
export const mapsUrl = (a: Atm) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${a.bank} ${a.local} Sequele Luanda`);

export function reward(atms: Atm[], a: Atm) {
  const b = near(atms, a.xy, a.id).find(x => x.status === 'tem' && x.ago != null && x.ago <= 120);
  if (!b) return { has: false as const, text: 'Nenhum ATM aqui perto tem kumbu confirmado agora. O teu registo ajuda quem vem a seguir.', maps: '' };
  const t = b.ago! < 1 ? 'agora mesmo' : ago(b.ago);
  return { has: true as const, text: `O ATM do ${b.a.bank} (${b.a.name}), a ${fmtD(b.d)}, tem kumbu ${t}.`, maps: mapsUrl(b.a) };
}

export const ago = (a: number | null) => a == null ? 'sem registos' : a < 1 ? 'agora' : a < 60 ? `há ${a} min` : `há ${Math.round(a / 60)} h`;
export const fmtD = (d: number) => d < 1000 ? `${Math.max(50, Math.round(d / 50) * 50)} m` : `${(d / 1000).toFixed(1).replace('.', ',')} km`;
