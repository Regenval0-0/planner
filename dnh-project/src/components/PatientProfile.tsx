import type { PatientTemplate } from '../data/gameData';
import { PATIENTS, PATIENT_STATE_LABELS, PATIENT_STATE_COLORS } from '../data/gameData';

interface Props {
  patient: PatientTemplate | null;
  onSelect: (p: PatientTemplate) => void;
}

export default function PatientProfile({ patient, onSelect }: Props) {
  return (
    <div>
      <label className="label">Выберите пациента:</label>
      <select
        className="select"
        value={patient?.id || ''}
        onChange={e => {
          const p = PATIENTS.find(x => x.id === e.target.value);
          if (p) onSelect(p);
        }}
      >
        <option value="">— Пациент —</option>
        {PATIENTS.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.gender === 'female' ? '♀' : '♂'} {p.age})
          </option>
        ))}
      </select>

      {patient && (
        <div className="patient-card">
          <div className="patient-header">
            <img src={patient.icon} alt={patient.name} className="patient-icon" />
            <div className="patient-header-text">
              <div className="patient-name">{patient.name}</div>
              <div
                className="patient-state-badge"
                style={{
                  backgroundColor: PATIENT_STATE_COLORS[patient.initialState] + '33',
                  borderColor: PATIENT_STATE_COLORS[patient.initialState],
                  color: PATIENT_STATE_COLORS[patient.initialState],
                }}
              >
                {PATIENT_STATE_LABELS[patient.initialState]}
              </div>
            </div>
          </div>

          <div className="patient-meta">
            Возраст: {patient.age} · Пол: {patient.gender === 'female' ? 'Жен' : 'Муж'}
          </div>

          <div className={`patient-allergy ${patient.blockedHumor ? 'bad' : 'good'}`}>
            Аллергия: {patient.allergy}
            {patient.blockedHumor && (
              <span> · Блок: {patient.blockedHumor}</span>
            )}
          </div>

          {patient.internalSymptoms.length > 0 && (
            <div className="patient-internal-symptoms">
              <div className="internal-label">Внутренние симптомы:</div>
              <div className="internal-list">
                {patient.internalSymptoms.map((s, i) => (
                  <span key={i} className="internal-tag">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
