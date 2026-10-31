import StatusBadge from './StatusBadge.jsx';

export default function HistoryTable({ scans }) {
  return (
    <div className="g4-card g4-history">
      <div className="g4-history-head">
        <div>
          <h2>Histórico de Rastreabilidade</h2>
          <p className="g4-sub">Peças que passaram pelo leitor (mais recentes primeiro)</p>
        </div>
        <span className="g4-count">Total: {scans.length}</span>
      </div>

      <div className="g4-table-wrap">
        <table className="g4-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>ID Peça</th>
              <th>Lote</th>
              <th>Origem</th>
              <th>Qualidade</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.eventId}>
                <td>{new Date(s.data.scannedAt).toLocaleTimeString('pt-BR')}</td>
                <td className="g4-strong">{s.data.pieceId}</td>
                <td>{s.data.lotId || '—'}</td>
                <td>{s.source}</td>
                <td>{s.data.quality !== undefined ? `${s.data.quality}%` : '—'}</td>
                <td>
                  <StatusBadge result={s.data.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scans.length === 0 && <p className="g4-empty">Nenhuma peça lida ainda.</p>}
      </div>
    </div>
  );
}
