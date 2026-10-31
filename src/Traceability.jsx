import { useEffect, useState } from 'react';
import './traceability.css';
import CameraReader from './components/CameraReader.jsx';
import ManualForm from './components/ManualForm.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import InspectionIndicator from './components/InspectionIndicator.jsx';
import { useTraceability } from './hooks/useTraceability.js';

const CONNECTION = {
  CONNECTED: { label: 'Shell conectado', dot: 'ok' },
  CONNECTING: { label: 'Conectando…', dot: 'warn' },
  DISCONNECTED: { label: 'Desconectado', dot: 'bad' },
  STALE: { label: 'Sem telemetria recente', dot: 'warn' },
};
const MACHINE_ALERTS = ['ALARM', 'SAFETY_FAULT', 'EMERGENCY'];

/**
 * Módulo G4 (exposto via Module Federation).
 * Prop `bus` (opcional): { subscribe(handler) => unsubscribe, publish(event) }.
 * Também escuta o evento global `smart40:telemetria` (detail.ultimaPecaLida).
 * Sem `bus`, funciona sozinho com um barramento local.
 */
export default function Traceability({ bus }) {
  const { scans, connection, machine, register } = useTraceability(bus);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  function handleRegister(input) {
    const r = register(input);
    const code = input.code?.trim();
    if (r.ok) {
      const { result, quality } = r.event.data;
      setNotice({ ok: true, text: `Peça ${code} registrada: ${result === 'APPROVED' ? 'APROVADA' : 'REJEITADA'} (${quality}%)` });
    } else {
      setNotice({
        ok: false,
        text: r.invalid ? 'Informe o ID da peça' : `Peça ${code} é a mesma da última leitura (ignorada)`,
      });
    }
    return r;
  }

  const conn = connection ? CONNECTION[connection.state] : { label: 'Aguardando Shell', dot: 'warn' };
  const machineAlert =
    machine && (machine.emergencyActive || MACHINE_ALERTS.includes(machine.status))
      ? machine.emergencyActive
        ? 'Emergência ativa na máquina'
        : `Máquina em ${machine.status}`
      : null;

  return (
    <div className="g4">
      <header className="g4-header">
        <div>
          <h1 className="g4-title">Estação de Rastreabilidade & Qualidade</h1>
          <p className="g4-sub">Grupo 4 • Leitura de QR Code, lote e inspeção</p>
        </div>
        <div className="g4-conn">
          <span className={`g4-dot g4-dot--${conn.dot}`} />
          {conn.label}
        </div>
      </header>

      {machineAlert && <div className="g4-banner g4-banner--alert">{machineAlert}</div>}
      {notice && (
        <div role="status" className={`g4-banner ${notice.ok ? 'g4-banner--ok' : 'g4-banner--warn'}`}>
          {notice.text}
        </div>
      )}

      <main className="g4-grid">
        <section className="g4-col">
          <InspectionIndicator last={scans[0]} />
          <CameraReader onScan={handleRegister} />
          <ManualForm onSubmit={handleRegister} />
        </section>
        <section className="g4-col">
          <HistoryTable scans={scans} />
        </section>
      </main>
    </div>
  );
}
