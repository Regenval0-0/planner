# Do No Harm — Извлечённые данные

Файл создан 2026-06-06. Содержит всё, что было извлечено из файлов игры для продолжения работы в другом чате.

---

## 1. Пути к файлам игры

```
C:/Program Files (x86)/Steam/steamapps/common/Do No Harm/
├── Do no Harm.exe
├── Do no Harm_Data/
│   ├── Managed/
│   │   └── Assembly-CSharp.dll          ← скрипты и строки механик
│   └── StreamingAssets/
│       └── (только аудио FMOD)
```

Unity-ресурсы лежат вне папки игры (в `steamapps/common/Do No Harm/` и соседних `.assets`/`.resS`).

---

## 2. Ключевые классы и строки из Assembly-CSharp.dll

### Дозировка и лечение
- `SetDose`
- `SyringeMedicine`
- `MixedSyringeMedicine`
- `Diagnosis`
- `DiagnosisTools`
- `TreatmentScore`
- `TreatmentState`
- `TreatmentStatus[Dynamic]`
- `TreatmentScoreAward`

### Гуморы и колесо
- `HumorsCircle`
- `HumorsDevice`
- `Humors`
- `Codex/HumorCircleSteps/+1`, `+2`, `+3`, `-1`, `-2`, `-3`

### Аллергии
- `AllergyBlockBlood`
- `AllergyBlockPhlegm`
- `AllergyBlockYellowBile`
- `AllergyBlockBlackBile`

### Персонажи / сюжет
- `PatientVisitProcess`
- `PatientAcceptance`
- `PatientInfoBlockView`
- `FishmanGameplayParameters`
- `PriestMedicineData`
- `PriestTreatmentData`
- `PanaceaMedicineComponent`
- `ParityMedicineComponent`
- `Nyarla_Cult_Potion`
- `give_no_medicine_to_nyarla`
- `DrugAddict/Event1/LowDose/1..5`
- `Response/SlowTreatment/1..5`
- `FragilePatientsOverride`

### Механика рандома
- `AffectRandomPatientPool`
- `CallRandomPatient`
- `PickRandomPatientProcess`
- `ChangeRandomPatientFlag`
- `canBeRandomPatient`
- `SetDailyPatients`
- `DailyPatientsBlock`

### Режимы игры
- `Classic_Fishman`
- `Chill_Fishman`
- `TimeRush_Fishman`
- `Nightmare_Fishman`
- `Infinity_Fishman`

---

## 3. Тексты механик из resources.assets

### Дозировка
```
These intervals show where the perfect dose (+3) is located.
Fully Healed (+3)
Your treatment gave a +1 effect.
The effect of the treatment you made is -2.
TreatmentState(+1), (+2), (+3), (-1), (-2), (-3)
Alta Dose (6-9)
Baixa Dosagem (1-5)
bassa dose (1-5)
```

### Ключевые правила
```
A dose of '3' for Blood doesn't combine with another '4' to make '7'. Each dose stands alone.
And the effect is divided by 2 because you didn't mix the medicines.
You must now administer either blood or phlegm to the patient, with a dosage between 1 and 5.
```

### Медицина
```
Vital Medicine: Blood + Phlegm
Digestive Medicine: Yellow Bile + Black Bile
Alternative medicine simply indicates which humors (Vital or Digestive) need treatment...
Female patients have weakness to high dose black bile medicine.
```

### Аллергии (полный список)
```
Almond, Banana, Beef, Carrots, Cats, Cockroaches, Dust, Eggs, Fish,
Flower, Garlic, Lemons, Milk, Nuts, Onions, Peanuts, Pumpkin,
Strawberries, Tomatoes, Water, NoAllergy
```

### Humor Circle
```
If a patient is allergic to the humor and dosage that would cure them, the doctor must consult the Humor Wheel to find the closest safe dose.
Rotate your treatment to +2 on the humor circle.
Use the mouse scroll to rotate the humor circle.
```

---

## 4. Извлечённые текстуры и спрайты

### Инструменты
- `UnityPy` установлен глобально (`python3 -m pip install UnityPy`).
- `AssetStudio` лежит в `C:/Ren/AssetStudio/`.
- `AssetRipper` лежит в `C:/Ren/AssetRipper/`.

### Папки с результатами
```
C:/Ren/dnh_images/        ← выход Python-скрипта (JPG/PNG)
C:/Ren/dnh_sprites/       ← выход sprite.image.save() (PNG)
C:/Ren/dnh_textures/      ← выход obj.read() (PNG)
```

### Найденные текстуры (resources.assets)

| Имя | Размер | Описание |
|-----|--------|----------|
| `BookSymptomSet_1` | 2015x2048 | Страницы Книги Медицины (симптомы) |
| `BookSymptomSet_2` | 2048x1229 | Ещё страницы Книги |
| `HumorsCircleAtlas` | 1972x1082 | Колесо гуморов |
| `Codex_atlas` | 752x1060 | Справочник |
| `BookMedicineAtlas` | 1198x1340 | Атлас лекарств |
| `TutorialAtlas` | 984x1072 | Туториал |
| `Fishman_simpton_Eye` | ~104x105 | Глаз рыбо-человека |
| `Fishman_simpton_no_Toth` | ~80x88 | Рот без зубов |
| `Blood_icon_big` | ~117x138 | Иконка крови |
| `Phlegm_icon_big` | ~100x100 | Иконка флегмы |
| `YellowBile_icon_big` | ~110x95 | Иконка жёлтой желчи |
| `BlackBile_icon_big` | ~108x119 | Иконка чёрной желчи |

### Атлас рыбо-людей
- `Atlas_Fsihman_Atlas` (2048x2048) — органы, глаза, рты, силуэты.

### Симптомы (спрайты из Atlas)
- `Atlas_Fishman_Symptom_1`…`24` (24 иконки, размер ~100-200px)
- `SymptomSketch_WhiteTopBile`, `Swelling`, `SpiderBite`, `RottenArea`, `WhiteTopSpots`, `BlackSpots`, `RedBile`, `RedSpots`, `Parasites` — наброски карандашом (альфа-маски, лучше смотреть на тёмном фоне).

### Прочее UI
- `setting_atlas_*`, `UI_pop_up_*`, `UITutorialAtlas`, `LevelDayConclussionBackground` и др.

---

## 5. Сюжетная структура (дни)

- `DayConclusion/StuffHappened/Day1` … `Day20` — каждый день имеет фиксированное событие.
- `DrugAddict/Event1/` — наркоман.
- `Priest/Event3/`, `Event4/`, `Event5/` — священник.
- `Witch/Event3/`, `Event4/` — ведьма.
- `Thomas/Event5/` — Томас.
- `Marianne/FinalVisit/` — Марианна (учебный пациент: `3 doses de Fleuma devem curar Marianne completamente`).

Обычные пациенты выбираются из `RandomPatientPool`, но RNG сидируется — при повторе дня те же пациенты и те же дозы.

---

## 6. План приложения (ожидает выбора формата)

**Формат:** React-веб / Electron / Standalone HTML — не выбран.

**Функции:**
1. **Профиль пациента:** выбор персонажа из пула (иконка, фиксированная аллергия, возраст, пол).
2. **Симптомы:** галерея с реальными иконками из игры (`Atlas_Fishman_Symptom_*`).
3. **Калькулятор дозы:** ввод гумора + тестовая доза + результат → вывод perfect dose (+3) через логику Humor Wheel.
4. **Калькулятор микса:** для Fishman (делитель ×2) и обычных — подбор комбинации доз для нужного суммарного эффекта.
5. **Справочник:** симптом → гумор + диапазон (1–3 / 4–6 / 7–9).

**Используемые данные из игры:**
- Иконки симптомов (`dnh_sprites/`)
- Иконки гуморов (`dnh_textures/`)
- Колесо гуморов (`HumorsCircleAtlas`)
- Тексты механик (`dnh_game_strings.txt`)

---

## 7. Как продолжить в новом чате

1. Убедиться, что `UnityPy` установлен: `python3 -m pip show UnityPy`.
2. Повторно извлечь спрайты скриптом (см. историю чата или `C:/Ren/dnh_sprites/` — уже на месте).
3. Если нужны имена конкретных NPC и их статы — искать в `.assets` через `UnityPy` с фильтром `MonoBehaviour` (требует знания структуры класса).
4. Копировать нужные PNG из `dnh_sprites/` и `dnh_textures/` в папку `public/` нового приложения.
5. Начать с создания компонента `SymptomSelector` и `DoseCalculator`.
