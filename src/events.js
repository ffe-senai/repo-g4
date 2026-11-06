import { SCHEMA_VERSION } from './contract/contrato-smart40-v0_1.ts';

// Regra do professor: qualidade >= 80 aprova, abaixo disso rejeita.
export const QUALITY_THRESHOLD = 80;

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toQuality = (q) => (q === null || q === undefined || q === '' ? NaN : Number(q));

export function resultFromQuality(quality) {
  const q = toQuality(quality);
  if (!Number.isFinite(q)) return 'PENDING';
  return q >= QUALITY_THRESHOLD ? 'APPROVED' : 'REJECTED';
}

function toIso(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Monta um TraceabilityScanEvent (contrato v0.1.0). O ID da peça é a tag RFID lida.
// `quality` (0-100) é um campo extra; o `result` sai da regra acima.
export function buildScanEvent({ code, lotId, quality, scannedAt, source = 'mock' }) {
  const when = toIso(scannedAt);
  const q = toQuality(quality);
  return {
    schemaVersion: SCHEMA_VERSION,
    eventId: newId(),
    type: 'traceability.piece-scanned',
    timestamp: when,
    source,
    data: {
      pieceId: code,
      code,
      lotId: lotId || undefined,
      scannedAt: when,
      result: resultFromQuality(q),
      quality: Number.isFinite(q) ? q : undefined,
    },
  };
}

// Normaliza uma peça vinda da telemetria (tag RFID em idPeca / id / rfidTag / tag / codigo).
export function normalizePiece(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const code = raw.idPeca ?? raw.id ?? raw.rfidTag ?? raw.tag ?? raw.codigo ?? raw.pieceId ?? raw.code;
  if (code === undefined || code === null || String(code).trim() === '') return null;
  return {
    code: String(code).trim(),
    quality: raw.qualidade ?? raw.quality,
    lotId: raw.lote ?? raw.lotId,
    scannedAt: raw.timestamp ?? raw.dataHora ?? raw.scannedAt,
  };
}

// Extrai a peça lida de um pacote de telemetria (detail do evento `smart40:telemetria`).
// Fonte principal: esteira.pecaAtual (tag RFID; string ou objeto). Também aceita ultimaPecaLida.
// Qualidade: no próprio objeto da peça, ou em esteira.qualidade / qualidade no topo.
export function extractPiece(telemetry) {
  if (!telemetry || typeof telemetry !== 'object') return null;
  const esteira = telemetry.esteira ?? {};
  const atual = esteira.pecaAtual ?? telemetry.pecaAtual;

  let raw = telemetry.ultimaPecaLida;
  if (!raw && atual) raw = typeof atual === 'object' ? atual : { id: atual };
  if (!raw || typeof raw !== 'object') return null;

  return normalizePiece({
    ...raw,
    qualidade:
      raw.qualidade ?? raw.quality ?? esteira.qualidade ?? esteira.qualidadePeca ?? telemetry.qualidade,
    timestamp: raw.timestamp ?? telemetry.timestamp,
  });
}
