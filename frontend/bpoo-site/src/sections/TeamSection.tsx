import SectionTitle from '../components/SectionTitle.tsx'
import TeamCard from '../components/TeamCard.tsx'

const team = [
  {
    name: 'Кухарь Елена Владимировна',
    role: 'Руководитель отдела инклюзивного и дополнительного образования, руководитель БПОО Кузбасса',
  },
  {
    name: 'Огородова Дарья Андреевна',
    role: 'Методист БПОО',
  },
  {
    name: 'Климович Никита Сергеевич',
    role: 'Техник-программист БПОО',
  },
  {
    name: 'Пинигина Татьяна Владимировна',
    role: 'Педагог-психолог',
  },
  {
    name: 'Калиничева Светлана Ивановна',
    role: 'Педагог-психолог',
  },
  {
    name: 'Хайдарова Марина Юрьевна',
    role: 'Педагог-психолог',
  },
]

export default function TeamSection() {
  return (
    <section className="relative z-10">
      <div className="section-container">
        <SectionTitle>Наша команда</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <TeamCard key={i} name={member.name} role={member.role} />
          ))}
        </div>
      </div>
    </section>
  )
}
