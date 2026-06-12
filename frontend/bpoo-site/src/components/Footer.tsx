import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative w-full" style={{ backgroundColor: '#f6f6f6' }}>
      <div className="section-container pb-12">
        <div className="mb-12">
          <p className="font-bold leading-[1.5] text-[#2c2c2c]" style={{ fontSize: 30 }}>
            Контакты
          </p>
          <div className="mt-4 h-[3px] w-[60%] bg-[#2c2c2c]" style={{ transform: 'skew(100deg)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Address */}
          <div>
            <ul className="list-none space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#363636] shrink-0 mt-0.5" />
                <span className="text-[#212121] text-lg">654015, Кемеровская область — Кузбасс, г. Новокузнецк, ул. Метёлкина, д. 17</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#363636] shrink-0" />
                <a href="tel:+73843328747" className="text-[#212121] hover:text-black text-lg transition-colors">8 (3843) 32-87-47</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#363636] shrink-0" />
                <a href="tel:+79089471147" className="text-[#212121] hover:text-black text-lg transition-colors">8-908-947-11-47</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#363636] shrink-0" />
                <a href="mailto:bpoo@pkgn.ru" className="text-[#212121] hover:text-black text-lg transition-colors">bpoo@pkgn.ru</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#363636] shrink-0 mt-0.5" />
                <span className="text-[#212121] text-lg">Пн — Пт: 8:30 – 16:30<br />Обед: 12:00 – 12:48</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <p className="font-bold text-xl text-[#2c2c2c] mb-4">Мы в соцсетях</p>
            <ul className="list-none space-y-3">
              <li>
                <a href="https://vk.com/bpoo42" target="_blank" rel="noopener noreferrer" className="text-[#212121] hover:text-black text-lg transition-colors">ВКонтакте</a>
              </li>
              <li>
                <a href="https://t.me/bpoo42" target="_blank" rel="noopener noreferrer" className="text-[#212121] hover:text-black text-lg transition-colors">Telegram</a>
              </li>
              <li>
                <a href="https://ok.ru/bpoopkgn" target="_blank" rel="noopener noreferrer" className="text-[#212121] hover:text-black text-lg transition-colors">Одноклассники</a>
              </li>
            </ul>
          </div>

          {/* Second campus */}
          <div>
            <p className="font-bold text-xl text-[#2c2c2c] mb-4">Второй корпус</p>
            <p className="text-[#212121] text-lg">
              г. Новокузнецк, ул. Обнорского, д. 92<br />
              <a href="tel:+73843375957" className="hover:text-black transition-colors">8 (3843) 37-59-57</a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#c7c7c7] text-center">
          <p className="text-[#363636] text-sm">© {new Date().getFullYear()} БПОО ГПОУ «Профессиональный колледж г.Новокузнецка»</p>
        </div>
      </div>
    </footer>
  )
}
