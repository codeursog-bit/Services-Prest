// Formater un montant en FCFA
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

// Formater une date en français
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Formater une date courte
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

// Obtenir les initiales d'un nom
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Réponse API standardisée
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Vérifier si une date est dépassée
export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// Calculer le nombre de jours jusqu'à une date
export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Labels des types de partenaires
export const PARTNER_TYPE_LABELS: Record<string, string> = {
  CLIENT:       'Client',
  FOURNISSEUR:  'Fournisseur',
  SOUS_TRAITANT:'Sous-traitant',
  PRESTATAIRE:  'Prestataire',
};

// Labels des statuts de partenaires
export const PARTNER_STATUS_LABELS: Record<string, string> = {
  ACTIF:     'Actif',
  INACTIF:   'Inactif',
  EN_ATTENTE:'En attente',
};

// Labels des statuts de factures
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  NON_SOLDE: 'Non soldé',
  EN_COURS:  'En cours',
  PAYE:      'Payé',
};

// Labels des statuts de dettes
export const DEBT_STATUS_LABELS: Record<string, string> = {
  ACCORDE:       'Accordé',
  REMBOURSE:     'Remboursé',
  NON_REMBOURSE: 'Non remboursé',
  REFUSE:        'Refusé',
};

// Labels des types de dettes
export const DEBT_TYPE_LABELS: Record<string, string> = {
  AVANCE_SALAIRE:  'Avance sur salaire',
  CAS_SOCIAL:      'Cas social',
  DETTE_ENTREPRISE:'Dette entreprise',
  AUTRE:           'Autre',
};

// Labels des statuts d'étapes de marché
export const STEP_STATUS_LABELS: Record<string, string> = {
  A_VENIR:  'À venir',
  EN_COURS: 'En cours',
  TERMINE:  'Terminé',
  RETARD:   'En retard',
  ANNULE:   'Annulé',
};

// Labels des statuts contentieux
export const CONTENTIEUX_STATUS_LABELS: Record<string, string> = {
  EN_COURS:  'En cours',
  RESOLU:    'Résolu',
  ABANDONNE: 'Abandonné',
};

// Classes CSS de couleur par statut (cohérence visuelle dans toute l'app)
export const STATUS_COLORS: Record<string, string> = {
  // Partenaire
  ACTIF:      'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]',
  INACTIF:    'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]',
  EN_ATTENTE: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]',
  // Facture
  NON_SOLDE:  'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]',
  EN_COURS:   'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]',
  PAYE:       'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]',
  // Étapes marché
  A_VENIR:    'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]',
  TERMINE:    'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]',
  RETARD:     'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]',
  ANNULE:     'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]',
  // Dettes
  ACCORDE:       'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]',
  REMBOURSE:     'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]',
  NON_REMBOURSE: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]',
  REFUSE:        'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]',
  // Contentieux
  RESOLU:     'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]',
  ABANDONNE:  'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]',
};
