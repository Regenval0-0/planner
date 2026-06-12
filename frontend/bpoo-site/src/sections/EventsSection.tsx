import { CalendarDays, Users, Sparkles } from 'lucide-react'
import SectionTitle from '../components/SectionTitle.tsx'

const events = [
  {
    icon: Sparkles,
    title: 'Абилимпикс Кузбасс',
    desc: 'Центр развития движения «Абилимпикс» в Кузбассе — чемпионат профессионального мастерства среди людей с инвалидностью и ОВЗ.',
    link: 'https://abilympics-kuzbass.ru/',
  },
  {
    icon: Users,
    title: 'Профориентационные мероприятия',
    desc: 'Проведение дней открытых дверей, профориентационных экскурсий и консультаций для абитуриентов с ОВЗ и их родителей.',
  },
  {
    icon: CalendarDays,
    title: 'Методические семинары',
    desc: 'Организация семинаров и вебинаров для педагогов по вопросам инклюзивного образования и адаптированных технологий обучения.',
  },
]

export default function EventsSection() {
  return (
    <section id="events" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Мероприятия</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev, i) => (
            <div key={i} className="card-original p-6 transition-all hover:bg-[#f0f0f0]">
              <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black mb-4">
                <ev.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">{ev.title}</h3>
              <p className="text-[#363636] text-sm leading-relaxed mb-4">{ev.desc}</p>
              {ev.link && (
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2128b8] hover:text-black font-medium text-sm transition-colors"
                >
                  Подробнее →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
