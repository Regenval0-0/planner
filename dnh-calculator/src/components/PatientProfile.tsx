import { PatientTemplate, PATIENTS } from '../data/gameData';

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
          <div className="patient-name">{patient.name}</div>
          <div className="patient-meta">
            Возраст: {patient.age} · Пол: {patient.gender === 'female' ? 'Жен' : 'Муж'}
          </div>
          <div className={`patient-allergy ${patient.blockedHumor ? 'bad' : 'good'}`}>
            Аллергия: {patient.allergy}
            {patient.blockedHumor && (
              <span> · Блок: {patient.blockedHumor}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
