import { useState } from 'react';
import { QUALITY_THRESHOLD, resultFromQuality } from '../events.js';

// Simulador: serve para testar o módulo sem a máquina e sem o leitor RFID.
export default function ManualForm({ onSubmit }) {
  const [code, setCode] = useState('');
  const [lotId, setLotId] = useState('');
  const [quality, setQuality] = useState('100');

  const preview = resultFromQuality(quality) === 'APPROVED' ? 'APROVADA' : 'REJEITADA';

  function handleSubmit(e) {
    e.preventDefault();
    const r = onSubmit({ code, lotId: lotId.trim(), quality: Number(quality) });
    if (r.ok) setCode('');
  }

  return (
    <div className="g4-card">
      <h2>Simular leitura RFID (teste)</h2>
      <form onSubmit={handleSubmit} className="g4-form">
        <label>
          Tag RFID / ID da peça
          <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: PECA-8831" />
        </label>
        <div className="g4-row">
          <label>
            Qualidade (%)
            <input
              type="number"
              required
              min="0"
              max="100"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
          </label>
          <label>
            Lote
            <input value={lotId} onChange={(e) => setLotId(e.target.value)} placeholder="LOT-A1" />
          </label>
        </div>
        <p className="g4-sub">
          Resultado: {preview} (aprova com {QUALITY_THRESHOLD}% ou mais)
        </p>
        <button type="submit" className="g4-btn g4-btn--primary">
          Registrar leitura
        </button>
      </form>
    </div>
  );
}
