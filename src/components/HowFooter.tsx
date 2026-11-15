import { Logo, Reveal } from './ui';

const STEPS = [
  ['1', 'Lê o QR no ATM', 'Abre direto na página daquele ATM. Nada para escolher.'],
  ['2', 'Um toque', 'Tem, pouco ou sem kumbu. O toque já envia.'],
  ['3', 'Vês os outros na hora', 'Qual ATM perto tem dinheiro, e há quanto tempo.']
];

export function How() {
  return (
    <section id="como" className="how">
      <Reveal className="" >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', maxWidth: 620 }}>
          <span className="eyebrow" style={{ letterSpacing: '.12em' }}>Como funciona</span>
          <h2 className="h2" style={{ fontSize: 'clamp(30px,5vw,48px)', textWrap: 'balance' }}>Cinco segundos à frente do ATM</h2>
          <p className="muted" style={{ fontSize: 16, lineHeight: 1.55, textWrap: 'pretty' }}>Sem conta, sem formulário. Cada ATM tem o seu QR — o link já sabe onde estás.</p>
        </div>
      </Reveal>
      <div className="steps">
        {STEPS.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 0.12}>
            <div className="step">
              <span aria-hidden="true" className="n">{n}</span>
              <b style={{ fontSize: 19, fontWeight: 600 }}>{t}</b>
              <span className="muted" style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 280, textWrap: 'pretty' }}>{d}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <Reveal as="footer">
      <div className="wrap" style={{ padding: '28px clamp(16px,4vw,40px) 40px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={18} />
        <span className="muted" style={{ fontSize: 14 }}>Feito pela vizinhança do Sequele · © 2026</span>
      </div>
    </Reveal>
  );
}
