import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import SectionTitle from '../components/SectionTitle.tsx'

const tasks = [
  {
    title: 'Содействие в создании условий доступности',
    text: 'Содействие в создании условий доступности СПО и ПО для обучающихся с инвалидностью и ОВЗ в ПОО в Кемеровской области – Кузбассе, в том числе через организацию сетевого взаимодействия.',
  },
  {
    title: 'Профориентация, образование и трудоустройство',
    text: 'Разработка и реализация комплекса мер по профессиональной ориентации, профессиональному образованию и трудоустройству инвалидов и лиц с ОВЗ в целях выбора, освоения ими профессии/специальности с учетом их способностей и склонностей, а также дальнейшего трудоустройства или занятости.',
  },
  {
    title: 'Психолого-педагогическое сопровождение',
    text: 'Реализация мероприятий по психолого-педагогическому сопровождению инвалидов и лиц с ОВЗ при освоении образовательных программ СПО и ПО.',
  },
  {
    title: 'Обобщение и масштабирование практик',
    text: 'Обобщение, тиражирование и масштабирование лучших практик, реализуемых в субъекте Российской Федерации.',
  },
  {
    title: 'Продвижение цифровых платформ',
    text: 'Продвижение цифровых платформ и сервисов инклюзивного образования (например, онлайн-ресурсы для АОП, виртуальные мастерские и т.д.).',
  },
  {
    title: 'Сбор и аналитика данных',
    text: 'Сбор, анализ и представление аналитических данных, отчетов, мониторингов о статусе инклюзивного образования в субъекте Российской Федерации.',
  },
]

export default function BasicInfoSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="basic-information" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Основные сведения</SectionTitle>

        {/* Goal */}
        <div className="card-original p-8 md:p-12 mb-12">
          <h3 className="font-bold text-black mb-4" style={{ fontSize: 24 }}>
            Цель БПОО
          </h3>
          <p className="text-black leading-relaxed" style={{ fontSize: 18 }}>
            Координация развития инклюзивного СПО и ПО в Кемеровской области – Кузбассе, разработка и внедрение региональной модели сетевого взаимодействия с ПОО Кемеровской области – Кузбасса, а также иными заинтересованными организациями для обеспечения условий доступности получения СПО и ПО для инвалидов и лиц с ОВЗ, в том числе в целях обеспечения реализации единой бесшовной модели профориентации, образования и трудоустройства обучающихся с инвалидностью и ограниченными возможностями здоровья на всех уровнях образования в Кемеровской области – Кузбассе.
          </p>
        </div>

        {/* Tasks accordion */}
        <h3 className="font-bold text-black mb-6" style={{ fontSize: 24 }}>Задачи БПОО</h3>
        <div className="space-y-4">
          {tasks.map((task, i) => {
            const open = openIndex === i
            return (
              <div key={i} className="card-original overflow-hidden">
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex-row-original w-full px-4"
                  aria-expanded={open}
                >
                  <span className="text-black font-medium text-base">{task.title}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-black ml-auto transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <div className="p-4 text-black" style={{ backgroundColor: '#f1f1f1', fontSize: 18 }}>
                    {task.text}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
