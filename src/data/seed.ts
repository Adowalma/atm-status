import type { Atm, LogEntry } from './types';

export const ME: [number, number] = [80, 40];

export const SEED: Atm[] = [
  { id: 'bai-entrada', bank: 'BAI', name: 'Entrada', local: 'Rotunda da entrada principal', xy: [0, 0], caixas: [{ n: 1, status: 'sem', ago: 35, conf: 6, disp: 0 }, { n: 2, status: 'pouco', ago: 50, conf: 2, disp: 1 }] },
  { id: 'bfa-mercado', bank: 'BFA', name: 'Mercado', local: 'Entrada do mercado do Sequele', xy: [250, -160], caixas: [{ n: 1, status: 'tem', ago: 20, conf: 8, disp: 0 }] },
  { id: 'atl-bloco14', bank: 'Atlântico', name: 'Bloco 14', local: 'Galeria comercial do Bloco 14', xy: [620, 300], caixas: [{ n: 1, status: 'tem', ago: 6, conf: 11, disp: 0 }, { n: 2, status: 'pouco', ago: 40, conf: 1, disp: 0 }] },
  { id: 'bic-bloco3', bank: 'BIC', name: 'Bloco 3', local: 'Junto à farmácia', xy: [-400, 350], caixas: [{ n: 1, status: 'pouco', ago: 14, conf: 3, disp: 1 }] },
  { id: 'bpc-rua21', bank: 'BPC', name: 'Rua 21', local: 'Ao lado da escola primária', xy: [900, -500], caixas: [{ n: 1, status: 'tem', ago: 31, conf: 2, disp: 0 }] },
  { id: 'bai-admin', bank: 'BAI', name: 'Administração', local: 'Edifício da administração', xy: [150, 700], caixas: [{ n: 1, status: 'sem', ago: 55, conf: 3, disp: 2 }] },
  { id: 'sol-bloco8', bank: 'Banco Sol', name: 'Bloco 8', local: 'Frente ao campo de jogos', xy: [-700, -300], caixas: [{ n: 1, status: 'unknown', ago: null, conf: 0, disp: 0 }] },
  { id: 'keve-bloco20', bank: 'Keve', name: 'Bloco 20', local: 'Junto à paragem de táxi', xy: [1200, 400], caixas: [{ n: 1, status: 'fora', ago: 180, conf: 4, disp: 0 }] }
];

export const LOG: LogEntry[] = [
  { atm: 'atl-bloco14', caixa: 1, status: 'tem', type: 'confirm', ago: 6, who: 'Vizinho do Bloco 12' },
  { atm: 'bic-bloco3', caixa: 1, status: 'pouco', type: 'report', ago: 14, who: 'Vizinha do Bloco 3' },
  { atm: 'bfa-mercado', caixa: 1, status: 'tem', type: 'confirm', ago: 20, who: 'Vizinha do Bloco 9' },
  { atm: 'bpc-rua21', caixa: 1, status: 'tem', type: 'report', ago: 31, who: 'Vizinho do Bloco 21' },
  { atm: 'bai-entrada', caixa: 1, status: 'sem', type: 'confirm', ago: 35, who: 'Vizinha do Bloco 1' },
  { atm: 'atl-bloco14', caixa: 2, status: 'pouco', type: 'report', ago: 40, who: 'Vizinha do Bloco 15' },
  { atm: 'bai-entrada', caixa: 2, status: 'pouco', type: 'report', ago: 50, who: 'Vizinho do Bloco 5' },
  { atm: 'bai-admin', caixa: 1, status: 'sem', type: 'report', ago: 55, who: 'Vizinho do Bloco 2' },
  { atm: 'keve-bloco20', caixa: 1, status: 'fora', type: 'report', ago: 180, who: 'Vizinha do Bloco 4' }
];
