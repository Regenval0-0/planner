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
  { key: 'blood',     name: 'Blood',      nameRu: 'Кровь',           type: 'vital',      icon: '/humors/Blood_icon_big.png',     color: '#b91c1c', bgClass: 'bg-red-700' },
  { key: 'phlegm',    name: 'Phlegm',     nameRu: 'Флегма',          type: 'vital',      icon: '/humors/Phlegm_icon_big.png',    color: '#2563eb', bgClass: 'bg-blue-600' },
  { key: 'yellow',    name: 'Yellow Bile',nameRu: 'Жёлтая желчь',    type: 'digestive',  icon: '/humors/YellowBile_icon_big.png',color: '#ca8a04', bgClass: 'bg-yellow-600' },
  { key: 'black',     name: 'Black Bile', nameRu: 'Чёрная желчь',    type: 'digestive',  icon: '/humors/BlackBile_icon_big.png', color: '#15803d', bgClass: 'bg-green-700' },
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
  range: [number, number]; // интервал дозы (например [1,5] или [6,9])
}

// Симптомы на основе извлечённых иконок и логики игры
// Диапазоны: Baixa (1-5), Alta (6-9). Внутри них perfect dose даёт +3
export const SYMPTOMS: Symptom[] = [
  { id: 'fs1',  name: 'Lungs',            nameRu: 'Лёгкие / дыхание',   image: '/symptoms/Atlas_Fishman_Symptom_1.png',  humor: 'phlegm', range: [1, 5] },
  { id: 'fs2',  name: 'Spots',            nameRu: 'Пятна',              image: '/symptoms/Atlas_Fishman_Symptom_2.png',  humor: 'blood',  range: [1, 5] },
  { id: 'fs3',  name: 'Bloating',         nameRu: 'Вздутие',            image: '/symptoms/Atlas_Fishman_Symptom_3.png',  humor: 'yellow', range: [1, 5] },
  { id: 'fs4',  name: 'Rash',             nameRu: 'Сыпь',               image: '/symptoms/Atlas_Fishman_Symptom_4.png',  humor: 'blood',  range: [6, 9] },
  { id: 'fs5',  name: 'Swelling',         nameRu: 'Опухоль / отёк',     image: '/symptoms/Atlas_Fishman_Symptom_5.png',  humor: 'phlegm', range: [6, 9] },
  { id: 'fs6',  name: 'Parasites',        nameRu: 'Паразиты',           image: '/symptoms/Atlas_Fishman_Symptom_6.png',  humor: 'yellow', range: [1, 5] },
  { id: 'fs7',  name: 'Fever',            nameRu: 'Жар',                image: '/symptoms/Atlas_Fishman_Symptom_7.png',  humor: 'blood',  range: [6, 9] },
  { id: 'fs8',  name: 'Cough',            nameRu: 'Кашель',             image: '/symptoms/Atlas_Fishman_Symptom_8.png',  humor: 'phlegm', range: [1, 5] },
  { id: 'fs9',  name: 'Stomach Pain',     nameRu: 'Боль в животе',      image: '/symptoms/Atlas_Fishman_Symptom_9.png',  humor: 'yellow', range: [6, 9] },
  { id: 'fs11', name: 'Scratches',        nameRu: 'Царапины',           image: '/symptoms/Atlas_Fishman_Symptom_11.png', humor: 'blood',  range: [1, 5] },
  { id: 'fs12', name: 'Pale Skin',        nameRu: 'Бледность',          image: '/symptoms/Atlas_Fishman_Symptom_12.png', humor: 'black',  range: [1, 5] },
  { id: 'fs14', name: 'Irritation',       nameRu: 'Раздражение кожи',   image: '/symptoms/Atlas_Fishman_Symptom_14.png', humor: 'yellow', range: [6, 9] },
  { id: 'fs15', name: 'Nausea',           nameRu: 'Тошнота',            image: '/symptoms/Atlas_Fishman_Symptom_15.png', humor: 'black',  range: [1, 5] },
  { id: 'fs16', name: 'Weakness',         nameRu: 'Слабость',           image: '/symptoms/Atlas_Fishman_Symptom_16.png', humor: 'black',  range: [6, 9] },
  { id: 'fs17', name: 'Headache',         nameRu: 'Головная боль',      image: '/symptoms/Atlas_Fishman_Symptom_17.png', humor: 'black',  range: [1, 5] },
  { id: 'fs20', name: 'Sharp Teeth',      nameRu: 'Острые зубы / рот',  image: '/symptoms/Atlas_Fishman_Symptom_20.png', humor: 'yellow', range: [6, 9] },
  { id: 'fs22', name: 'Red Eyes',         nameRu: 'Красные глаза',      image: '/symptoms/Atlas_Fishman_Symptom_22.png', humor: 'blood',  range: [6, 9] },
  { id: 'fs23', name: 'Black Spots',      nameRu: 'Чёрные пятна',       image: '/symptoms/Atlas_Fishman_Symptom_23.png', humor: 'black',  range: [6, 9] },
  { id: 'fs24', name: 'Rotten Area',      nameRu: 'Гниение',            image: '/symptoms/Atlas_Fishman_Symptom_24.png', humor: 'phlegm', range: [6, 9] },
];

export interface PatientTemplate {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  allergy: Allergy;
  blockedHumor: Humor | null;
  icon?: string;
}

// Примерный пул фоновых персонажей (имена из текстов игры)
export const PATIENTS: PatientTemplate[] = [
  { id: 'p1', name: 'Nia Kingsley',      age: 34, gender: 'female', allergy: 'Fish',      blockedHumor: 'blood' },
  { id: 'p2', name: 'Edmund Blackwood',    age: 52, gender: 'male',   allergy: 'Dust',      blockedHumor: 'phlegm' },
  { id: 'p3', name: 'Eduardo Blackwood',   age: 29, gender: 'male',   allergy: 'Peanuts',   blockedHumor: 'yellow' },
  { id: 'p4', name: 'Nigel',               age: 41, gender: 'male',   allergy: 'Milk',      blockedHumor: 'black' },
  { id: 'p5', name: 'Captain',             age: 48, gender: 'male',   allergy: 'Cats',      blockedHumor: 'blood' },
  { id: 'p6', name: 'Benny',               age: 24, gender: 'male',   allergy: 'Eggs',      blockedHumor: 'phlegm' },
  { id: 'p7', name: 'Marianne',            age: 19, gender: 'female', allergy: 'NoAllergy', blockedHumor: null },
  { id: 'p8', name: 'Random Male A',       age: 30, gender: 'male',   allergy: 'Flower',    blockedHumor: 'yellow' },
  { id: 'p9', name: 'Random Female B',     age: 27, gender: 'female', allergy: 'Garlic',    blockedHumor: 'black' },
  { id: 'p10',name: 'Random Male C',       age: 55, gender: 'male',   allergy: 'Banana',    blockedHumor: 'phlegm' },
  { id: 'p11',name: 'Random Female D',     age: 62, gender: 'female', allergy: 'Almond',    blockedHumor: 'blood' },
  { id: 'p12',name: 'Random Male E',       age: 38, gender: 'male',   allergy: 'Water',     blockedHumor: 'yellow' },
];

// Эффекты от дозы (расстояние от perfect dose)
export const EFFECT_LABELS: Record<number, string> = {
  3: 'Fully Healed (+3)',
  2: 'Good (+2)',
  1: 'Weak (+1)',
  0: 'No Effect (0)',
  '-1': 'Harm (-1)',
  '-2': 'Bad (-2)',
  '-3': 'Critical (-3)',
};

/**
 * Логика Humor Wheel:
 * Для гумора существует "perfect dose" D. Каждый шаг от D меняет эффект.
 * Если аллергия блокирует гумор H, нельзя давать H. Нужно искать ближайший безопасный.
 * Предполагаем, что "ближайший безопасный" — это rotate на колесе к другому гумору
 * с сохранением близости к нужной дозе.
 *
 * Упрощённая модель для калькулятора:
 * - Если тестовая доза d даёт эффект e, то perfect dose = d + (e направление).
 *   Например, e=+2 → надо +1 к дозе для +3. e=+1 → +2 к дозе. e=0 → ±3. e=-1 → ±4.
 *   Но мы не знаем точную формулу.
 *
 * Практичный подход: показываем пользователю направление (больше/меньше)
 * и вычисляем возможные perfect doses внутри диапазона.
 */
export function suggestDoses(
  testDose: number,
  effect: number,
  range: [number, number],
  blockedHumor: Humor | null,
  targetHumor: Humor
): { doses: number[]; direction: string; note: string } {
  // effect: 3=perfect, 2=close, 1=far, 0=miss, -1..-3 = wrong side
  // предположим linear: perfect = testDose + (3 - effect)
  // но это очень грубо. Сделаем range-based.
  const [min, max] = range;
  const candidates: number[] = [];

  if (effect === 3) {
    candidates.push(testDose);
  } else if (effect >= 0) {
    // Чем ниже effect, тем дальше perfect dose
    const shift = 3 - effect;
    if (testDose + shift <= max) candidates.push(testDose + shift);
    if (testDose - shift >= min && testDose - shift !== testDose + shift) candidates.push(testDose - shift);
  } else {
    // negative effect: мы пошли в противоположную сторону
    const shift = Math.abs(effect) + 3;
    if (testDose + shift <= max) candidates.push(testDose + shift);
    if (testDose - shift >= min) candidates.push(testDose - shift);
  }

  // Фильтруем валидные дозы 1..9 и уникальность
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

/** Подбор микса для Fishman / обычного пациента */
export function calculateMix(
  targetEffect: number,
  isFishman: boolean,
  blockedHumors: Humor[]
): Array<{ humor: Humor; dose: number; note: string }> | null {
  // Упрощённая модель: каждый гумор вносит свой эффект, не аддитивен,
  // но при миксе Fishman-штраф уменьшается (делитель 1/2 → эффект удваивается относительно одиночного).
  // Для простоты: если нужен +3 и один гумор заблокирован, берём два других.
  const available = HUMORS.filter(h => !blockedHumors.includes(h.key));
  if (available.length === 0) return null;

  // Примерная логика: perfect dose одного гумора = +3.
  // Для fishman без микса: эффект /2. С миксом — штраф меньше (или идеально).
  // Простая эвристика: для fishman рекомендуем смешать 2 гумора по perfect dose.
  const result = available.slice(0, 2).map(h => ({
    humor: h.key,
    dose: 5, // placeholder — в реальности зависит от пациента
    note: isFishman ? 'Fishman: эффект смеси выше, чем одиночного гумора.' : '',
  }));
  return result;
}
