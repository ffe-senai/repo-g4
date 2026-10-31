import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createLocalBus } from '../bus.js';
import { buildScanEvent, normalizePiece } from '../events.js';

const MAX_HISTORY = 500;
const byDateDesc = (a, b) => new Date(b.data.scannedAt) - new Date(a.data.scannedAt);

// Ouve o barramento (Shell ou local) e o evento global `smart40:telemetria`,
// e mantém o histórico em memória.
export function useTraceability(externalBus) {
  const localBus = useMemo(() => createLocalBus(), []);
  const bus = externalBus ?? localBus;

  const [scans, setScans] = useState([]);
  const [connection, setConnection] = useState(null);
  const [machine, setMachine] = useState(null);
  const seenEvents = useRef(new Set());
  const lastPieceRef = useRef(null);

  // Só registra quando o código da peça MUDA (a mesma peça parada na esteira não repete).
  const addScan = useCallback((event) => {
    const { eventId, data } = event;
    if (seenEvents.current.has(eventId)) return false;
    if (data.pieceId === lastPieceRef.current) return false;
    seenEvents.current.add(eventId);
    lastPieceRef.current = data.pieceId;
    setScans((prev) => [event, ...prev].sort(byDateDesc).slice(0, MAX_HISTORY));
    return true;
  }, []);

  // Barramento do Shell
  useEffect(
    () =>
      bus.subscribe((event) => {
        switch (event?.type) {
          case 'traceability.piece-scanned':
            addScan(event);
            break;
          case 'connection.state':
            setConnection(event.data);
            break;
          case 'machine.telemetry':
            setMachine(event.data);
            break;
          default:
        }
      }),
    [bus, addScan],
  );

  // Telemetria global: detail.ultimaPecaLida
  useEffect(() => {
    const onTelemetry = (e) => {
      const piece = normalizePiece(e.detail?.ultimaPecaLida);
      if (piece) addScan(buildScanEvent({ ...piece, source: 'gateway' }));
    };
    window.addEventListener('smart40:telemetria', onTelemetry);
    return () => window.removeEventListener('smart40:telemetria', onTelemetry);
  }, [addScan]);

  // Sem Shell (standalone), simula a conexão para o indicador.
  useEffect(() => {
    if (externalBus) return;
    localBus.publish({
      schemaVersion: '0.1.0',
      eventId: `local-conn-${Date.now()}`,
      type: 'connection.state',
      timestamp: new Date().toISOString(),
      source: 'mock',
      data: { state: 'CONNECTED' },
    });
  }, [externalBus, localBus]);

  // Leitura local (câmera ou manual): registra e publica no barramento.
  const register = useCallback(
    (input) => {
      const code = input.code?.trim();
      if (!code) return { ok: false, invalid: true };
      const event = buildScanEvent({ ...input, code });
      if (!addScan(event)) return { ok: false, duplicate: true };
      bus.publish(event);
      return { ok: true, event };
    },
    [bus, addScan],
  );

  return { scans, connection, machine, register };
}
