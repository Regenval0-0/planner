import { Accessibility, Phone, MessageCircle, Info } from 'lucide-react'
import SectionTitle from '../components/SectionTitle.tsx'

export default function AccessibilitySection() {
  return (
    <section id="accessibility" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Доступная среда</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card-original p-6">
            <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Адаптированные программы</h3>
            <p className="text-[#363636] text-sm leading-relaxed">
              Разработка адаптированных образовательных программ с учётом особенностей здоровья обучающихся.
            </p>
          </div>

          <div className="card-original p-6">
            <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Консультирование</h3>
            <p className="text-[#363636] text-sm leading-relaxed">
              Консультации по вопросам приёма, обучения, прохождения ГИА, практик и дистанционного обучения.
            </p>
          </div>

          <div className="card-original p-6">
            <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Информирование</h3>
            <p className="text-[#363636] text-sm leading-relaxed">
              Обеспечение информирования по вопросам поступления и обучения инвалидов и лиц с ОВЗ.
            </p>
          </div>
        </div>

        <div className="card-original p-10 text-center">
          <div className="w-16 h-16 bg-[#fcdd51] rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">Горячая линия</h3>
          <p className="text-lg md:text-xl text-[#363636] mb-6 max-w-2xl mx-auto">
            По вопросам поступления и обучения инвалидов и лиц с ОВЗ
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+73843328747"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#fcdd51] text-black font-bold rounded-lg text-lg hover:bg-[#f3db5d] transition-colors"
            >
              <Phone className="w-5 h-5" />
              8 (3843) 32-87-47
            </a>
            <a
              href="tel:+79089471147"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#e4e4e4] hover:bg-[#dadada] text-black font-bold rounded-lg text-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              8-908-947-11-47
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
