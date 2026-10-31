const LABELS = { APPROVED: 'APROVADA', REJECTED: 'REJEITADA', PENDING: 'PENDENTE' };

export default function StatusBadge({ result }) {
  const key = LABELS[result] ? result : 'PENDING';
  return <span className={`g4-badge g4-badge--${key.toLowerCase()}`}>{LABELS[key]}</span>;
}
