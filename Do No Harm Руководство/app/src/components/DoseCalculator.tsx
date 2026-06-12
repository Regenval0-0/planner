import { useState } from 'react';
import type { PatientTemplate, Humor, SuggestDosesResult } from '../data/gameData';
import { HUMORS, suggestDoses, EFFECT_LABELS } from '../data/gameData';

interface Props {
  patient: PatientTemplate | null;
  targetHumor: Humor | null;
  symptomRange: [number, number];
}

export default function DoseCalculator({ patient, targetHumor, symptomRange }: Props) {
  const [testDose, setTestDose] = useState<number | ''>('');
  const [effect, setEffect] = useState<number>(0);
  const [result, setResult] = useState<SuggestDosesResult | null>(null);

  const handleCalculate = () => {
    if (!patient || !targetHumor || testDose === '') return;
    const res = suggestDoses(
      Number(testDose),
      effect,
      symptomRange,
      patient.blockedHumor,
      targetHumor
    );
    setResult(res);
  };

  const humorInfo = targetHumor ? HUMORS.find(h => h.key === targetHumor) : null;

  return (
    <div className="dose-form">
      <div className="dose-row">
        <div className="dose-group">
          <label>Тестовая доза (1–9)</label>
          <input
            type="number"
            min={1}
            max={9}
            className="dose-input"
            value={testDose}
            onChange={e => setTestDose(e.target.value === '' ? '' : Math.min(9, Math.max(1, Number(e.target.value))))}
            placeholder="5"
          />
        </div>
        <div className="dose-group">
          <label>Результат</label>
          <select
            className="dose-select"
            value={effect}
            onChange={e => setEffect(Number(e.target.value))}
          >
            <option value={3}>+3 — Fully Healed</option>
            <option value={2}>+2 — Good</option>
            <option value={1}>+1 — Weak</option>
            <option value={0}>0 — No Effect</option>
            <option value={-1}>-1 — Harm</option>
            <option value={-2}>-2 — Bad</option>
            <option value={-3}>-3 — Critical</option>
          </select>
        </div>
      </div>

      {!patient && <div className="result-note">Сначала выберите пациента</div>}
      {!targetHumor && patient && <div className="result-note">Выберите симптом, чтобы определить целевой гумор</div>}

      <button
        className="dose-btn"
        onClick={handleCalculate}
        disabled={!patient || !targetHumor || testDose === ''}
      >
        Рассчитать идеальную дозу
      </button>

      {humorInfo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <img src={humorInfo.icon} alt={humorInfo.name} width={28} height={28} />
          <span style={{ color: humorInfo.color, fontWeight: 600 }}>{humorInfo.nameRu}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>[</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{symptomRange[0]}-{symptomRange[1]}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>]</span>
        </div>
      )}

      {result && (
        <div className={`dose-result ${result.doses.length > 0 ? 'success' : 'danger'}`}>
          <div className="result-label">Возможные perfect doses (+3):</div>
          <div className="result-value">
            {result.doses.length > 0 ? result.doses.join(', ') : 'Нет валидных доз в диапазоне'}
          </div>
          <div className="result-note">{result.direction}</div>
          {result.note && <div className="result-note" style={{ color: 'var(--warning)' }}>{result.note}</div>}
        </div>
      )}
    </div>
  );
}
