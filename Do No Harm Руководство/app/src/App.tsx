import { useState } from 'react';
import './index.css';
import PatientProfile from './components/PatientProfile';
import SymptomGallery from './components/SymptomGallery';
import DoseCalculator from './components/DoseCalculator';
import MixCalculator from './components/MixCalculator';
import type { PatientTemplate, Humor, Symptom } from './data/gameData';

export default function App() {
  const [selectedPatient, setSelectedPatient] = useState<PatientTemplate | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [targetHumor, setTargetHumor] = useState<Humor | null>(null);

  const handleSymptomToggle = (symptom: Symptom) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (exists) return prev.filter(s => s.id !== symptom.id);
      if (prev.length === 0) setTargetHumor(symptom.humor);
      return [...prev, symptom];
    });
  };

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
    setTargetHumor(null);
  };

  const dominantHumor = targetHumor || selectedSymptoms[0]?.humor || null;
  const dominantRange: [number, number] = [1, 9];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Do No Harm</h1>
        <p>Dosage Calculator — рассчитай идеальную дозу для каждого пациента</p>
      </header>

      <div className="app-grid">
        <section className="card">
          <h2>Пациент</h2>
          <PatientProfile
            patient={selectedPatient}
            onSelect={setSelectedPatient}
          />
        </section>

        <section className="card">
          <div className="flex-between">
            <h2>Симптомы ({selectedSymptoms.length})</h2>
            {selectedSymptoms.length > 0 && (
              <button className="btn-small" onClick={clearSymptoms}>Очистить</button>
            )}
          </div>
          <SymptomGallery
            selected={selectedSymptoms}
            onToggle={handleSymptomToggle}
          />
          {dominantHumor && (
            <div className="humor-badge" style={{ marginTop: '16px' }}>
              <strong>Целевой гумор:</strong> {dominantHumor}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Калькулятор дозы</h2>
          <DoseCalculator
            patient={selectedPatient}
            targetHumor={dominantHumor}
            symptomRange={dominantRange}
          />
        </section>

        <section className="card">
          <h2>Калькулятор микса</h2>
          <MixCalculator
            patient={selectedPatient}
          />
        </section>
      </div>
    </div>
  );
}
