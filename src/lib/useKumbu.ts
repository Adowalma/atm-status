import { useCallback, useEffect, useRef, useState } from 'react';
import { mockApi } from '../data/mockApi';
import type { KumbuApi, ReportReceipt, ReportStatus, Snapshot } from '../data/types';

export type Demo = 'real' | 'loading' | 'error' | 'offline' | 'empty';
export type Phase = 'loading' | 'ready' | 'error';

const EMPTY: Snapshot = { atms: [], log: [] };

export function useKumbu(demo: Demo, api: KumbuApi = mockApi) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [offline, setOffline] = useState(demo === 'offline' || (typeof navigator !== 'undefined' && !navigator.onLine));
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    const on = () => setOffline(demo === 'offline' ? true : false);
    const off = () => setOffline(true);
    addEventListener('online', on); addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, [demo]);

  const load = useCallback(async () => {
    setPhase('loading');
    if (demo === 'loading') return;
    if (demo === 'error') { setPhase('error'); return; }
    try {
      const s = await api.load();
      if (!alive.current) return;
      setSnap(demo === 'empty'
        ? { atms: s.atms.map(a => ({ ...a, caixas: a.caixas.map(c => ({ ...c, status: 'unknown' as const, ago: null, conf: 0, disp: 0 })) })), log: [] }
        : s);
      setOffline(demo === 'offline' || !navigator.onLine);
      setPhase('ready');
    } catch {
      if (alive.current) setPhase('error');
    }
  }, [api, demo]);

  useEffect(() => { void load(); }, [load]);

  const report = useCallback(async (atmId: string, caixas: number[], status: ReportStatus): Promise<ReportReceipt> => {
    const { next, receipt } = await api.report(atmId, caixas, status, snapRef.current);
    const r = { ...receipt, queued: offline };
    if (alive.current) setSnap(next);
    return r;
  }, [api, offline]);

  const confirm = useCallback(async (atmId: string, caixa: number) => {
    const next = await api.confirm(atmId, caixa, snapRef.current);
    if (alive.current) setSnap(next);
  }, [api]);

  const undo = useCallback(async (receipt: ReportReceipt) => {
    const prev = await api.undo(receipt);
    if (alive.current) setSnap(prev);
  }, [api]);

  return { phase, atms: snap.atms, log: snap.log, offline, load, report, confirm, undo };
}

export type Kumbu = ReturnType<typeof useKumbu>;
