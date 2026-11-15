import type { Kumbu } from '../lib/useKumbu';
import { ME } from '../data/seed';
import { fmtD, near } from '../lib/status';
import { CloseIcon, Dot, Sheet } from './ui';

export function Pick({ k, onClose, onPick }: { k: Kumbu; onClose: () => void; onPick: (id: string) => void }) {
  return (
    <Sheet labelledBy="tkp" onClose={onClose} maxWidth={520} z={55}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h3 id="tkp" className="display" style={{ fontSize: 28, letterSpacing: '-.025em' }}>Em que ATM estás?</h3>
          <span className="muted" style={{ fontSize: 14, lineHeight: 1.5, textWrap: 'pretty' }}>Os mais perto de ti primeiro. Da próxima vez, lê o QR do ATM — abre direto.</span>
        </div>
        <button className="icon-btn boxed zoom" onClick={onClose} aria-label="Fechar"><CloseIcon /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {near(k.atms, ME, null).map(n => (
          <button key={n.a.id} className="row-card" onClick={() => onPick(n.a.id)}>
            <Dot status={n.status} />
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <b style={{ fontWeight: 600, fontSize: 16 }}>{n.a.bank} · {n.a.name}</b>
              <span className="muted" style={{ fontSize: 13 }}>{n.a.local}</span>
            </span>
            <span className="mono muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtD(n.d)}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
