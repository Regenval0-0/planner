import { useState } from 'react';
import type { PatientTemplate, Humor, MixResult } from '../data/gameData';
import { HUMORS, calculateMix } from '../data/gameData';

interface Props {
  patient: PatientTemplate | null;
}

export default function MixCalculator({ patient }: Props) {
  const [isFishman, setIsFishman] = useState(false);
  const [targetEffect, setTargetEffect] = useState(3);
  const [mix, setMix] = useState<MixResult>(null);

  const handleCalculate = () => {
    if (!patient) return;
    const blocked = patient.blockedHumor ? [patient.blockedHumor] : [];
    const res = calculateMix(targetEffect, isFishman, blocked);
    setMix(res);
  };

  return (
    <div className="dose-form">
      <div className="dose-row">
        <div className="dose-group">
          <label>Режим</label>
          <select
            className="dose-select"
            value={isFishman ? 'fishman' : 'normal'}
            onChange={e => setIsFishman(e.target.value === 'fishman')}
          >
            <option value="normal">Обычный</option>
            <option value="fishman">Fishman (штраф ×½)</option>
          </select>
        </div>
        <div className="dose-group">
          <label>Целевой эффект</label>
          <select
            className="dose-select"
            value={targetEffect}
            onChange={e => setTargetEffect(Number(e.target.value))}
          >
            <option value={3}>+3 — Fully Healed</option>
            <option value={4}>+4 — Strong</option>
            <option value={5}>+5 — Maximum</option>
          </select>
        </div>
      </div>

      {!patient && <div className="result-note">Сначала выберите пациента</div>}

      <button
        className="dose-btn"
        onClick={handleCalculate}
        disabled={!patient}
      >
        Подобрать микс
      </button>

      {isFishman && (
        <div className="result-note" style={{ marginTop: 8, color: 'var(--warning)' }}>
          ⚠️ Fishman: эффект одиночного препарата делится на 2. Смешивайте 2+ гумора для лучшего результата.
        </div>
      )}

      {mix && (
        <div className="mix-grid" style={{ marginTop: 12 }}>
          {mix.map((item, i) => {
            const info = HUMORS.find(h => h.key === item.humor);
            return (
              <div key={i} className="mix-row">
                <img
                  src={info?.icon || ''}
                  alt={info?.name}
                  className="mix-humor-icon"
                />
                <div className="mix-info">
                  <div className="mix-name">{info?.nameRu || item.humor}</div>
                  <div className="mix-dose">Доза: {item.dose}</div>
                  {item.note && <div className="mix-note">{item.note}</div>}
                </div>
              </div>
            );
          })}
          {mix.length === 0 && (
            <div className="dose-result danger">
              <div className="result-note">Все гуморы заблокированы аллергией. Используйте Humor Wheel.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
