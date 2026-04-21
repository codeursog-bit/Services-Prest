/**
 * Styles partagés dashboard — tokens couleur MSP
 * Import: import { ic, lc, card, btn, badge } from '@/lib/dash-styles';
 * Règle : ne jamais modifier les appels API, uniquement les couleurs UI
 */

// Input / Select
export const ic = [
  'w-full px-[13px] py-[9px]',
  'border border-[var(--border)] rounded-[8px]',
  'text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)]',
  'placeholder:text-[var(--text-muted)]',
  'outline-none transition-all',
  'focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]',
].join(' ');

// Label
export const lc = 'block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]';

// Card container
export const card = [
  'rounded-[12px] overflow-hidden',
  'bg-[var(--bg-card)] border border-[var(--border)]',
].join(' ');

// Bouton primaire bleu
export const btnPrimary = [
  'inline-flex items-center gap-[6px]',
  'bg-[var(--accent-primary)] text-white',
  'py-[8px] px-[16px] rounded-[8px]',
  'text-[13px] font-medium transition-all',
  'hover:opacity-90 disabled:opacity-60',
].join(' ');

// Bouton secondaire
export const btnSecondary = [
  'inline-flex items-center gap-[6px]',
  'bg-[var(--bg-surface)] text-[var(--text-primary)]',
  'border border-[var(--border)]',
  'py-[8px] px-[16px] rounded-[8px]',
  'text-[13px] font-medium transition-all',
  'hover:border-[var(--border-strong)]',
].join(' ');

// Bouton orange accent
export const btnOrange = [
  'inline-flex items-center gap-[6px]',
  'bg-[var(--accent-orange)] text-white',
  'py-[8px] px-[16px] rounded-[8px]',
  'text-[13px] font-medium transition-all',
  'hover:opacity-90 disabled:opacity-60',
].join(' ');

// Table header
export const th = 'py-[11px] px-[20px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]';

// Table row
export const tr = 'border-b border-[var(--divider)] hover:bg-[var(--bg-surface)] transition-colors';

// Table cell
export const td = 'py-[13px] px-[20px]';

// Filter pill actif
export const filterActive = 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]';
// Filter pill inactif
export const filterInactive = 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]';

// Section title inside card
export const sectionTitle = 'text-[14px] font-semibold text-[var(--text-primary)]';
export const sectionSub   = 'text-[12px] text-[var(--text-secondary)]';

// Feedback success / error
export const feedbackOk  = 'rounded-[8px] p-[10px_14px] text-[13px] border bg-[var(--msp-green-light)] border-[var(--msp-green)] text-[var(--msp-green)]';
export const feedbackErr = 'rounded-[8px] p-[10px_14px] text-[13px] border bg-[var(--msp-red-light)] border-[var(--msp-red)] text-[var(--msp-red)]';

// Badge statuts communs
export const STATUS_BADGE: Record<string, string> = {
  ACTIF:         'bg-[var(--msp-green-light)] text-[var(--msp-green)] border border-[var(--msp-green)]',
  INACTIF:       'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]',
  EN_ATTENTE:    'bg-[var(--msp-amber-light)] text-[var(--msp-amber)] border border-[var(--msp-amber)]',
  EN_COURS:      'bg-[var(--msp-amber-light)] text-[var(--msp-amber)] border border-[var(--msp-amber)]',
  SUSPENDU:      'bg-[var(--msp-red-light)] text-[var(--msp-red)] border border-[var(--msp-red)]',
  CLOTURE:       'bg-[var(--msp-green-light)] text-[var(--msp-green)] border border-[var(--msp-green)]',
  CONTENTIEUX:   'bg-[var(--msp-red-light)] text-[var(--msp-red)] border border-[var(--msp-red)]',
  PAYE:          'bg-[var(--msp-green-light)] text-[var(--msp-green)] border border-[var(--msp-green)]',
  NON_SOLDE:     'bg-[var(--msp-red-light)] text-[var(--msp-red)] border border-[var(--msp-red)]',
  REMBOURSE:     'bg-[var(--msp-green-light)] text-[var(--msp-green)] border border-[var(--msp-green)]',
  NON_REMBOURSE: 'bg-[var(--msp-red-light)] text-[var(--msp-red)] border border-[var(--msp-red)]',
  ACCORDE:       'bg-[var(--msp-amber-light)] text-[var(--msp-amber)] border border-[var(--msp-amber)]',
  REFUSE:        'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]',
  AVANCE_SALAIRE:  'bg-[var(--msp-blue-light)] text-[var(--msp-blue)] border border-[var(--msp-blue)]',
  CAS_SOCIAL:      'bg-[var(--msp-blue-light)] text-[var(--msp-blue)] border border-[var(--msp-blue)]',
  DETTE_ENTREPRISE:'bg-[var(--msp-amber-light)] text-[var(--msp-amber)] border border-[var(--msp-amber)]',
  AUTRE:           'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]',
};
