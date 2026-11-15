import { useCallback, useEffect, useRef, useState } from 'react';
import type { Demo } from './useKumbu';

/** Esc to close, scroll lock, focus the dialog on open and restore focus on close. */
export function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', key);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => { removeEventListener('keydown', key); document.body.style.overflow = o; prev?.focus?.(); };
  }, []);
  return ref;
}

export function useReveal<T extends HTMLElement>() {
  const [on, setOn] = useState(typeof IntersectionObserver === 'undefined');
  const ref = useRef<T>(null);
  useEffect(() => {
    if (on || !ref.current) return;
    const io = new IntersectionObserver(es => es.forEach(e => setOn(e.isIntersecting)), { rootMargin: '-6% 0px -10% 0px' });
    io.observe(ref.current);
    const t = setTimeout(() => setOn(true), 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [on]);
  return [ref, on] as const;
}

/** True while the element is on screen (starts true so nothing waits for the first observer callback). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

/** True while the tab is in the background. */
export function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.hidden);
  useEffect(() => {
    const f = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  return hidden;
}

export function useReducedMotion() {
  const [r, setR] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return r;
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const t = useRef<number>();
  const flash = useCallback((m: string) => {
    clearTimeout(t.current); setToast(m); t.current = window.setTimeout(() => setToast(null), 4200);
  }, []);
  return { toast, flash };
}

export function useCopy(flash: (m: string) => void) {
  const [copied, setCopied] = useState<string | null>(null);
  const t = useRef<number>();
  const copy = useCallback((text: string, key: string) => {
    const done = () => { clearTimeout(t.current); setCopied(key); t.current = window.setTimeout(() => setCopied(null), 2000); flash('Link copiado.'); };
    try { navigator.clipboard.writeText(text).then(done, () => flash(text)); } catch { flash(text); }
  }, [flash]);
  return { copied, copy };
}

export function readUrl() {
  const m = location.pathname.match(/\/atm\/([a-z0-9-]+)/i) ?? location.hash.match(/atm\/([a-z0-9-]+)/i);
  const p = new URLSearchParams(location.search);
  const c = parseInt(p.get('c') ?? '', 10);
  const demoMap: Record<string, Demo> = { 'a carregar': 'loading', carregar: 'loading', loading: 'loading', erro: 'error', error: 'error', 'sem rede': 'offline', offline: 'offline', 'sem dados': 'empty', empty: 'empty' };
  return {
    atm: m ? m[1].toLowerCase() : null,
    src: (p.get('src') ?? 'link').replace(/[^a-z]/gi, '') || 'link',
    caixa: c > 0 ? c : ('all' as const),
    demo: demoMap[(p.get('estado') ?? '').toLowerCase()] ?? ('real' as Demo)
  };
}
