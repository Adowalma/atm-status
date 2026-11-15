import { LOG, SEED } from './seed';
import type { KumbuApi, Snapshot } from './types';

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** In-memory mock. Swap this object for a real implementation of KumbuApi later. */
export const mockApi: KumbuApi = {
  async load() {
    await wait(1200);
    return { atms: SEED, log: LOG };
  },
  async report(atmId, caixas, status, current) {
    await wait(650);
    const atms = current.atms.map(a => a.id !== atmId ? a : {
      ...a,
      caixas: a.caixas.map(c => !caixas.includes(c.n) ? c : c.status === status ? { ...c, conf: c.conf + 1, ago: 0 } : { ...c, status, conf: 1, disp: 0, ago: 0 })
    });
    const entries = caixas.map(n => ({ atm: atmId, caixa: n, status, type: 'report' as const, ago: 0, who: 'Tu' }));
    return { next: { atms, log: [...entries, ...current.log] }, receipt: { queued: false, previous: current } };
  },
  async confirm(atmId, caixa, current) {
    await wait(150);
    const c = current.atms.find(a => a.id === atmId)?.caixas.find(x => x.n === caixa);
    if (!c) return current;
    return {
      atms: current.atms.map(a => a.id !== atmId ? a : { ...a, caixas: a.caixas.map(x => x.n !== caixa ? x : { ...x, conf: x.conf + 1, ago: 0 }) }),
      log: [{ atm: atmId, caixa, status: c.status, type: 'confirm', ago: 0, who: 'Tu' }, ...current.log]
    };
  },
  async undo(receipt): Promise<Snapshot> {
    return receipt.previous;
  }
};
