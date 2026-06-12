import { Compass, Map, BookMarked } from 'lucide-react'
import SectionTitle from '../components/SectionTitle.tsx'

export default function CareerSection() {
  return (
    <section id="career" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Профориентация</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="card-original p-6 flex gap-4">
              <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">Профориентация</h3>
                <p className="text-[#363636]">
                  Комплекс мер по профессиональной ориентации инвалидов и лиц с ОВЗ с учётом их способностей, склонностей и состояния здоровья.
                </p>
              </div>
            </div>

            <div className="card-original p-6 flex gap-4">
              <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black shrink-0">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">Атлас доступных профессий</h3>
                <p className="text-[#363636]">
                  Актуализация и ведение Атласа доступных профессий и Атласа профессий для лиц с интеллектуальными нарушениями.
                </p>
              </div>
            </div>

            <div className="card-original p-6 flex gap-4">
              <div className="w-12 h-12 bg-[#e4e4e4] rounded-xl flex items-center justify-center text-black shrink-0">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">Трудоустройство</h3>
                <p className="text-[#363636]">
                  Содействие в дальнейшем трудоустройстве или занятости с учётом индивидуальных возможностей выпускников.
                </p>
              </div>
            </div>
          </div>

          <div className="card-original p-8">
            <h3 className="font-bold text-black mb-4" style={{ fontSize: 22 }}>
              Единая бесшовная модель
            </h3>
            <p className="text-black mb-6 leading-relaxed">
              Обеспечение реализации единой бесшовной модели профориентации, образования и трудоустройства обучающихся с инвалидностью и ограниченными возможностями здоровья на всех уровнях образования в Кемеровской области – Кузбассе.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-[#e4e4e4] rounded-full text-sm font-medium text-black">Профориентация</span>
              <span className="px-4 py-2 bg-[#e4e4e4] rounded-full text-sm font-medium text-black">Образование</span>
              <span className="px-4 py-2 bg-[#e4e4e4] rounded-full text-sm font-medium text-black">Трудоустройство</span>
              <span className="px-4 py-2 bg-[#e4e4e4] rounded-full text-sm font-medium text-black">Сопровождение</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
