import { FileText, GraduationCap, BookOpen, Globe } from 'lucide-react'
import SectionTitle from '../components/SectionTitle.tsx'

const directions = [
  {
    icon: GraduationCap,
    title: 'Среднее профессиональное образование',
    text: 'Программы СПО для инвалидов и лиц с ОВЗ с адаптированными образовательными программами и индивидуальными учебными планами.',
  },
  {
    icon: BookOpen,
    title: 'Профессиональное обучение',
    text: 'Краткосрочные программы профессионального обучения и дополнительного профессионального образования.',
  },
  {
    icon: Globe,
    title: 'Дистанционное обучение',
    text: 'Организация дистанционного обучения с использованием цифровых образовательных платформ и сервисов.',
  },
]

const documents = [
  { label: 'Приказ МО №2831 о деятельности БПОО', href: './documents/basicInformation/Documents/Приказ_МО_№2831_О_деятельности_БПОО.pdf' },
  { label: 'Постановление Правительства Кемеровской области №282', href: './documents/homepage/Постановление Правительства Кемеровской области - Кузбасса №282 от 20.05.2026 _О внесении и_(1926655v6)_.pdf' },
  { label: 'Постановление Правительства Кемеровской области №401', href: './documents/homepage/Постановление_Правительства_Кемеровской_области_Кузбасса_№401_от.pdf' },
  { label: 'Список ПОО БПОО (часть 1)', href: './documents/homepage/Список ПОО  БПОО 1.pdf' },
  { label: 'Список ПОО БПОО (часть 2)', href: './documents/homepage/Список ПОО  БПОО 2.pdf' },
  { label: 'Список ПОО БПОО (часть 3)', href: './documents/homepage/Список ПОО  БПОО 3.pdf' },
]

export default function EducationSection() {
  return (
    <section id="education" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Образование</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {directions.map((d, i) => (
            <div key={i} className="card-original p-6 transition-colors duration-300 hover:bg-[#f0f0f0]">
              <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black mb-4">
                <d.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">{d.title}</h3>
              <p className="text-[#363636] text-sm leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-black mb-6 flex items-center gap-2" style={{ fontSize: 20 }}>
          <FileText className="w-5 h-5" />
          Нормативные документы
        </h3>

        <div className="card-original overflow-hidden">
          <ul className="divide-y divide-[#c7c7c7]">
            {documents.map((doc, i) => (
              <li key={i}>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f0f0f0]"
                >
                  <FileText className="w-5 h-5 text-[#2128b8] shrink-0" />
                  <span className="text-black text-sm">{doc.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
