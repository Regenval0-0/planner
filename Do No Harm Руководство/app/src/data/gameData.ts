export type Humor = 'blood' | 'phlegm' | 'yellow' | 'black';

export interface HumorInfo {
  key: Humor;
  name: string;
  nameRu: string;
  type: 'vital' | 'digestive';
  icon: string;
  color: string;
  bgClass: string;
}

export const HUMORS: HumorInfo[] = [
  { key: 'blood',     name: 'Blood',      nameRu: 'Кровь',           type: 'vital',      icon: './humors/Blood_icon_big.png',     color: '#b91c1c', bgClass: 'bg-red-700' },
  { key: 'phlegm',    name: 'Phlegm',     nameRu: 'Флегма',          type: 'vital',      icon: './humors/Phlegm_icon_big.png',    color: '#2563eb', bgClass: 'bg-blue-600' },
  { key: 'yellow',    name: 'Yellow Bile',nameRu: 'Жёлтая желчь',    type: 'digestive',  icon: './humors/YellowBile_icon_big.png',color: '#ca8a04', bgClass: 'bg-yellow-600' },
  { key: 'black',     name: 'Black Bile', nameRu: 'Чёрная желчь',    type: 'digestive',  icon: './humors/BlackBile_icon_big.png', color: '#15803d', bgClass: 'bg-green-700' },
];

export const ALLERGIES = [
  'Almond','Banana','Beef','Carrots','Cats','Cockroaches','Dust','Eggs','Fish',
  'Flower','Garlic','Lemons','Milk','Nuts','Onions','Peanuts','Pumpkin',
  'Strawberries','Tomatoes','Water','NoAllergy',
] as const;

export type Allergy = typeof ALLERGIES[number];

export const ALLERGY_BLOCKS: Record<string, Humor> = {
  AllergyBlockBlood: 'blood',
  AllergyBlockPhlegm: 'phlegm',
  AllergyBlockYellowBile: 'yellow',
  AllergyBlockBlackBile: 'black',
};

export interface Symptom {
  id: string;
  name: string;
  nameRu: string;
  image: string;
  humor: Humor;
  range: [number, number];
  type: 'external' | 'internal';
}

export const SYMPTOMS: Symptom[] = [
  { id: 'fs1',  name: 'Lungs',            nameRu: 'Лёгкие / дыхание',   image: './symptoms/Atlas_Fishman_Symptom_1.png',  humor: 'phlegm', range: [1, 5], type: 'external' },
  { id: 'fs2',  name: 'Spots',            nameRu: 'Пятна',              image: './symptoms/Atlas_Fishman_Symptom_2.png',  humor: 'blood',  range: [1, 5], type: 'external' },
  { id: 'fs3',  name: 'Bloating',         nameRu: 'Вздутие',            image: './symptoms/Atlas_Fishman_Symptom_3.png',  humor: 'yellow', range: [1, 5], type: 'external' },
  { id: 'fs4',  name: 'Rash',             nameRu: 'Сыпь',               image: './symptoms/Atlas_Fishman_Symptom_4.png',  humor: 'blood',  range: [6, 9], type: 'external' },
  { id: 'fs5',  name: 'Swelling',         nameRu: 'Опухоль / отёк',     image: './symptoms/Atlas_Fishman_Symptom_5.png',  humor: 'phlegm', range: [6, 9], type: 'external' },
  { id: 'fs6',  name: 'Parasites',        nameRu: 'Паразиты',           image: './symptoms/Atlas_Fishman_Symptom_6.png',  humor: 'yellow', range: [1, 5], type: 'external' },
  { id: 'fs7',  name: 'Fever',            nameRu: 'Жар',                image: './symptoms/Atlas_Fishman_Symptom_7.png',  humor: 'blood',  range: [6, 9], type: 'external' },
  { id: 'fs8',  name: 'Cough',            nameRu: 'Кашель',             image: './symptoms/Atlas_Fishman_Symptom_8.png',  humor: 'phlegm', range: [1, 5], type: 'external' },
  { id: 'fs9',  name: 'Stomach Pain',     nameRu: 'Боль в животе',      image: './symptoms/Atlas_Fishman_Symptom_9.png',  humor: 'yellow', range: [6, 9], type: 'external' },
  { id: 'fs11', name: 'Scratches',        nameRu: 'Царапины',           image: './symptoms/Atlas_Fishman_Symptom_11.png', humor: 'blood',  range: [1, 5], type: 'external' },
  { id: 'fs12', name: 'Pale Skin',        nameRu: 'Бледность',          image: './symptoms/Atlas_Fishman_Symptom_12.png', humor: 'black',  range: [1, 5], type: 'external' },
  { id: 'fs14', name: 'Irritation',       nameRu: 'Раздражение кожи',   image: './symptoms/Atlas_Fishman_Symptom_14.png', humor: 'yellow', range: [6, 9], type: 'external' },
  { id: 'fs15', name: 'Nausea',           nameRu: 'Тошнота',            image: './symptoms/Atlas_Fishman_Symptom_15.png', humor: 'black',  range: [1, 5], type: 'external' },
  { id: 'fs16', name: 'Weakness',         nameRu: 'Слабость',           image: './symptoms/Atlas_Fishman_Symptom_16.png', humor: 'black',  range: [6, 9], type: 'external' },
  { id: 'fs17', name: 'Headache',         nameRu: 'Головная боль',      image: './symptoms/Atlas_Fishman_Symptom_17.png', humor: 'black',  range: [1, 5], type: 'external' },
  { id: 'fs20', name: 'Sharp Teeth',      nameRu: 'Острые зубы / рот',  image: './symptoms/Atlas_Fishman_Symptom_20.png', humor: 'yellow', range: [6, 9], type: 'external' },
  { id: 'fs22', name: 'Red Eyes',         nameRu: 'Красные глаза',      image: './symptoms/Atlas_Fishman_Symptom_22.png', humor: 'blood',  range: [6, 9], type: 'external' },
  { id: 'fs23', name: 'Black Spots',      nameRu: 'Чёрные пятна',       image: './symptoms/Atlas_Fishman_Symptom_23.png', humor: 'black',  range: [6, 9], type: 'external' },
  { id: 'fs24', name: 'Rotten Area',      nameRu: 'Гниение',            image: './symptoms/Atlas_Fishman_Symptom_24.png', humor: 'phlegm', range: [6, 9], type: 'external' },
];

export interface InternalSymptom {
  id: string;
  nameRu: string;
  humor: Humor;
}

export const INTERNAL_SYMPTOMS: InternalSymptom[] = [
  { id: 'in1', nameRu: 'Головокружение', humor: 'blood' },
  { id: 'in2', nameRu: 'Тошнота', humor: 'yellow' },
  { id: 'in3', nameRu: 'Слабость', humor: 'black' },
  { id: 'in4', nameRu: 'Боль в груди', humor: 'blood' },
  { id: 'in5', nameRu: 'Одышка', humor: 'phlegm' },
  { id: 'in6', nameRu: 'Жар', humor: 'blood' },
  { id: 'in7', nameRu: 'Озноб', humor: 'phlegm' },
  { id: 'in8', nameRu: 'Потливость', humor: 'yellow' },
  { id: 'in9', nameRu: 'Головная боль', humor: 'black' },
  { id: 'in10', nameRu: 'Тревога', humor: 'yellow' },
  { id: 'in11', nameRu: 'Сонливость', humor: 'phlegm' },
  { id: 'in12', nameRu: 'Мышечные спазмы', humor: 'black' },
];

export type PatientState = 'conscious' | 'unconscious' | 'critical' | 'weak' | 'aggressive' | 'scared' | 'delirious';

export const PATIENT_STATE_LABELS: Record<PatientState, string> = {
  conscious: 'В сознании',
  unconscious: 'Без сознания',
  critical: 'Критическое',
  weak: 'Слабый',
  aggressive: 'Агрессивный',
  scared: 'Испуган',
  delirious: 'Бред',
};

export const PATIENT_STATE_COLORS: Record<PatientState, string> = {
  conscious: '#4a9a5a',
  unconscious: '#7a8194',
  critical: '#c93c3c',
  weak: '#c4a030',
  aggressive: '#c93c3c',
  scared: '#4a7a9a',
  delirious: '#9a5a9a',
};

export interface PatientTemplate {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  allergy: Allergy;
  blockedHumor: Humor | null;
  icon: string;
  initialState: PatientState;
  internalSymptoms: string[];
}

export const PATIENTS: PatientTemplate[] = [
  { id: 'p1', name: 'Nia Kingsley',      age: 34, gender: 'female', allergy: 'Fish',      blockedHumor: 'blood',  icon: './patients/eye.png',    initialState: 'weak',      internalSymptoms: ['Головокружение', 'Слабость'] },
  { id: 'p2', name: 'Edmund Blackwood',  age: 52, gender: 'male',   allergy: 'Dust',      blockedHumor: 'phlegm', icon: './patients/body.png',   initialState: 'conscious', internalSymptoms: ['Одышка', 'Кашель'] },
  { id: 'p3', name: 'Eduardo Blackwood', age: 29, gender: 'male',   allergy: 'Peanuts',   blockedHumor: 'yellow', icon: './patients/mouth.png',  initialState: 'aggressive',internalSymptoms: ['Тошнота', 'Жар'] },
  { id: 'p4', name: 'Nigel',             age: 41, gender: 'male',   allergy: 'Milk',      blockedHumor: 'black',  icon: './patients/eye_b.png',  initialState: 'scared',    internalSymptoms: ['Тревога', 'Потливость'] },
  { id: 'p5', name: 'Captain',           age: 48, gender: 'male',   allergy: 'Cats',      blockedHumor: 'blood',  icon: './patients/body.png',   initialState: 'critical',  internalSymptoms: ['Боль в груди', 'Озноб'] },
  { id: 'p6', name: 'Benny',             age: 24, gender: 'male',   allergy: 'Eggs',      blockedHumor: 'phlegm', icon: './patients/mouth2.png', initialState: 'delirious', internalSymptoms: ['Бред', 'Головная боль'] },
  { id: 'p7', name: 'Marianne',          age: 19, gender: 'female', allergy: 'NoAllergy', blockedHumor: null,   icon: './patients/eye.png',    initialState: 'conscious', internalSymptoms: ['Сонливость'] },
  { id: 'p8', name: 'Random Male A',     age: 30, gender: 'male',   allergy: 'Flower',    blockedHumor: 'yellow', icon: './patients/body.png',   initialState: 'weak',      internalSymptoms: ['Слабость', 'Мышечные спазмы'] },
  { id: 'p9', name: 'Random Female B',   age: 27, gender: 'female', allergy: 'Garlic',    blockedHumor: 'black',  icon: './patients/eye_b.png',  initialState: 'scared',    internalSymptoms: ['Тревога', 'Головокружение'] },
  { id: 'p10',name: 'Random Male C',     age: 55, gender: 'male',   allergy: 'Banana',    blockedHumor: 'phlegm', icon: './patients/mouth.png',  initialState: 'unconscious',internalSymptoms: ['Одышка'] },
  { id: 'p11',name: 'Random Female D',   age: 62, gender: 'female', allergy: 'Almond',    blockedHumor: 'blood',  icon: './patients/eye.png',    initialState: 'critical',  internalSymptoms: ['Боль в груди', 'Жар', 'Слабость'] },
  { id: 'p12',name: 'Random Male E',     age: 38, gender: 'male',   allergy: 'Water',     blockedHumor: 'yellow', icon: './patients/body.png',   initialState: 'conscious', internalSymptoms: ['Потливость'] },
];

export const EFFECT_LABELS: Record<number, string> = {
  3: 'Fully Healed (+3)',
  2: 'Good (+2)',
  1: 'Weak (+1)',
  0: 'No Effect (0)',
  '-1': 'Harm (-1)',
  '-2': 'Bad (-2)',
  '-3': 'Critical (-3)',
};

export interface SuggestDosesResult { doses: number[]; direction: string; note: string }

export function suggestDoses(
  testDose: number,
  effect: number,
  range: [number, number],
  blockedHumor: Humor | null,
  targetHumor: Humor
): SuggestDosesResult {
  const [min, max] = range;
  const candidates: number[] = [];

  if (effect === 3) {
    candidates.push(testDose);
  } else if (effect >= 0) {
    const shift = 3 - effect;
    if (testDose + shift <= max) candidates.push(testDose + shift);
    if (testDose - shift >= min && testDose - shift !== testDose + shift) candidates.push(testDose - shift);
  } else {
    const shift = Math.abs(effect) + 3;
    if (testDose + shift <= max) candidates.push(testDose + shift);
    if (testDose - shift >= min) candidates.push(testDose - shift);
  }

  const valid = Array.from(new Set(candidates.filter(d => d >= 1 && d <= 9)));

  let direction = '';
  if (effect === 3) direction = 'Это идеальная доза!';
  else if (effect === 2) direction = 'Близко! Попробуйте чуть больше или меньше.';
  else if (effect === 1) direction = 'Неплохо, но нужно корректировать дозу сильнее.';
  else if (effect <= 0) direction = 'Совсем мимо. Меняйте дозу радикально или проверьте гумор.';

  let note = '';
  if (blockedHumor === targetHumor) {
    note = '⚠️ Аллергия на этот гумор! Используйте Humor Wheel, чтобы найти ближайший безопасный.';
  }
  if (targetHumor === 'black' && max >= 6) {
    note += (note ? ' ' : '') + '⚠️ Женщины уязвимы к высоким дозам чёрной желчи.';
  }

  return { doses: valid, direction, note };
}

export type MixResult = Array<{ humor: Humor; dose: number; note: string }> | null;

export function calculateMix(
  _targetEffect: number,
  isFishman: boolean,
  blockedHumors: Humor[]
): MixResult {
  const available = HUMORS.filter(h => !blockedHumors.includes(h.key));
  if (available.length === 0) return null;

  const result = available.slice(0, 2).map(h => ({
    humor: h.key,
    dose: 5,
    note: isFishman ? 'Fishman: эффект смеси выше, чем одиночного гумора.' : '',
  }));
  return result;
}
