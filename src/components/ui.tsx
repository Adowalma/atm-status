import type { CSSProperties, ReactNode } from 'react';
import { useDialog, useReveal } from '../lib/hooks';
import { ST } from '../lib/status';
import type { StatusKey } from '../data/types';

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <span className="t">tem</span>
      <span className="k"><span className="bar"><i /></span><span className="w">kumbu</span></span>
      <span className="q">?</span>
    </span>
  );
}

/** ATM mark; `px` is the em size (symbol is 9.6em wide). */
export function AtmSymbol({ status, px, slit }: { status: StatusKey; px: number; slit?: string }) {
  const s = ST[status];
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: '#111', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <div aria-hidden="true" className="sym" style={{ fontSize: px, ...(slit ? { ['--slit' as string]: slit } : {}) } as CSSProperties}>
      <div className="top"><div className="slit" /></div>
      <div className="scr" style={{ background: s.color }}>
        {s.icon === 'check' && <svg {...p} strokeWidth="3.4"><polyline points="5,12.5 10,17.5 19,7" /></svg>}
        {s.icon === 'dash' && <svg {...p} strokeWidth="3.4"><line x1="6" y1="12" x2="18" y2="12" /></svg>}
        {s.icon === 'x' && <svg {...p} strokeWidth="3.4"><line x1="7" y1="7" x2="17" y2="17" /><line x1="17" y1="7" x2="7" y2="17" /></svg>}
        {s.icon === 'power' && <svg {...p} strokeWidth="3.2"><path d="M12 4v7" /><path d="M7.5 7.5a6.5 6.5 0 1 0 9 0" /></svg>}
        {s.icon === 'q' && <span className="qm">?</span>}
      </div>
    </div>
  );
}

export const Dot = ({ status, color }: { status?: StatusKey; color?: string }) => (
  <span aria-hidden="true" className="dot" style={{ background: color ?? ST[status ?? 'unknown'].dot }} />
);

export const Skel = ({ w, h, r, style }: { w: number | string; h: number; r?: number; style?: CSSProperties }) => (
  <span className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }: { children: ReactNode; delay?: number; as?: 'div' | 'section' | 'footer'; className?: string; id?: string }) {
  const [ref, on] = useReveal<HTMLDivElement>();
  return <Tag ref={ref as never} className={`reveal ${on ? '' : 'off'} ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined} {...rest}>{children}</Tag>;
}

export const CloseIcon = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

export function Sheet({ labelledBy, onClose, maxWidth, z = 50, children }: { labelledBy: string; onClose: () => void; maxWidth: number; z?: number; children: ReactNode }) {
  const ref = useDialog(onClose);
  return (
    <div className="layer" style={{ zIndex: z }} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="scrim" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="sheet" style={{ maxWidth }}>
        <div className="grab" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
