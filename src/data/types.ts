export type StatusKey = 'tem' | 'pouco' | 'sem' | 'fora' | 'unknown';
export type ReportStatus = Exclude<StatusKey, 'unknown'>;

export interface Caixa {
  n: number;
  status: StatusKey;
  /** minutes since last report; null = never reported */
  ago: number | null;
  conf: number;
  disp: number;
}

export interface Atm {
  id: string;
  bank: string;
  name: string;
  local: string;
  /** metres from a local origin (mock). Replace with lat/lng when a real backend exists. */
  xy: [number, number];
  caixas: Caixa[];
}

export interface LogEntry {
  atm: string;
  caixa: number;
  status: StatusKey;
  type: 'report' | 'confirm';
  ago: number;
  who: string;
}

export interface Snapshot {
  atms: Atm[];
  log: LogEntry[];
}

export interface ReportReceipt {
  /** true when the report was stored locally and will be sent when the network is back */
  queued: boolean;
  /** state to restore when the user taps "desfazer" */
  previous: Snapshot;
}

/** Contract between the UI and any backend (mock now, Supabase/REST later). */
export interface KumbuApi {
  load(): Promise<Snapshot>;
  report(atmId: string, caixas: number[], status: ReportStatus, current: Snapshot): Promise<{ next: Snapshot; receipt: ReportReceipt }>;
  confirm(atmId: string, caixa: number, current: Snapshot): Promise<Snapshot>;
  undo(receipt: ReportReceipt): Promise<Snapshot>;
}
