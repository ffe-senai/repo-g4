import { QUALITY_THRESHOLD } from '../events.js';

const LABELS = { APPROVED: 'APROVADA', REJECTED: 'REJEITADA', PENDING: 'PENDENTE' };

// Sinalização grande da última peça inspecionada.
export default function InspectionIndicator({ last }) {
  const result = last?.data.result;
  const quality = last?.data.quality;
  const key = result && LABELS[result] ? result.toLowerCase() : 'idle';

  return (
    <div className={`g4-inspect g4-inspect--${key}`} role="status" aria-live="polite">
      <div className="g4-inspect-label">{result ? LABELS[result] : 'AGUARDANDO PEÇA'}</div>
      {last && (
        <>
          <div className="g4-inspect-piece">{last.data.pieceId}</div>
          {quality !== undefined && (
            <div className="g4-inspect-reason">
              Qualidade: {quality}% (mínimo {QUALITY_THRESHOLD}%)
            </div>
          )}
        </>
      )}
    </div>
  );
}
