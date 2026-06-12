import { Symptom, SYMPTOMS } from '../data/gameData';

interface Props {
  selected: Symptom[];
  onToggle: (s: Symptom) => void;
}

export default function SymptomGallery({ selected, onToggle }: Props) {
  return (
    <div className="symptom-grid">
      {SYMPTOMS.map(s => {
        const isActive = selected.some(x => x.id === s.id);
        return (
          <button
            key={s.id}
            className={`symptom-tile ${isActive ? 'active' : ''}`}
            onClick={() => onToggle(s)}
            title={`${s.nameRu} → ${s.humor} [${s.range[0]}-${s.range[1]}]`}
          >
            <img
              src={s.image}
              alt={s.name}
              className="symptom-img"
              loading="lazy"
            />
            <div className="symptom-caption">{s.nameRu}</div>
            <div className="symptom-humor">{s.humor}</div>
          </button>
        );
      })}
    </div>
  );
}
