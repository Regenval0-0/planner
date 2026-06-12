import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import MobileMenu from './MobileMenu.tsx'

const navItems = [
  { label: 'Основные сведения', href: '#basic-information' },
  { label: 'Образование', href: '#education' },
  { label: 'Профориентация', href: '#career' },
  { label: 'Мероприятия', href: '#events' },
  { label: 'Партнёры', href: '#partners' },
  { label: 'Доступная среда', href: '#accessibility' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* College logo outside header */}
      <a
        href="https://pkgn.ru"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-[10px] left-[20px] z-[9999] hidden lg:block"
        style={{ transform: 'rotate(-10deg)', transition: 'transform 0.5s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-10deg)' }}
        aria-label="Профессиональный колледж г.Новокузнецка"
      >
        <img
          src="./images/klogonew.png"
          alt="Логотип колледжа"
          className="h-[70px] w-auto"
        />
      </a>

      <header
        className="fixed top-0 left-0 right-0 z-[9998] h-[80px]"
        style={{ backgroundColor: '#fcdd51' }}
      >
        <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-around">
            {/* BPOO Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex shrink-0 items-center"
              style={{ maxWidth: 100 }}
            >
              <img
                src="./images/logo.png"
                alt="БПОО"
                className="h-full w-auto"
                style={{ maxHeight: 60 }}
              />
            </a>

            {/* Desktop Nav */}
            <nav aria-label="Основная навигация" className="hidden lg:flex items-center">
              <ul className="flex items-center">
                {navItems.map((item) => (
                  <li key={item.href} className="flex px-5">
                    <a
                      href={item.href}
                      className="relative font-light text-black no-underline transition-colors duration-500"
                      style={{ fontSize: 'clamp(12px, 1.1vw, 16px)' }}
                      onMouseEnter={(e) => {
                        const after = e.currentTarget.querySelector('span') as HTMLElement
                        if (after) after.style.width = '100%'
                        e.currentTarget.style.color = '#363636'
                      }}
                      onMouseLeave={(e) => {
                        const after = e.currentTarget.querySelector('span') as HTMLElement
                        if (after) after.style.width = '0%'
                        e.currentTarget.style.color = '#000'
                      }}
                    >
                      {item.label}
                      <span
                        className="absolute bottom-0 left-0 block h-[2px] transition-all duration-500 ease-out"
                        style={{
                          width: '0%',
                          backgroundColor: '#363636',
                        }}
                      />
                    </a>
                  </li>
                ))}

                {/* VK */}
                <li className="flex items-center justify-center px-4">
                  <a
                    href="https://vk.com/bpoo42"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-bold text-sm transition-transform duration-500 hover:rotate-[15deg] hover:text-[#363636]"
                    aria-label="ВКонтакте"
                  >
                    VK
                  </a>
                </li>

                {/* Telegram */}
                <li className="flex items-center justify-center px-4">
                  <a
                    href="https://t.me/bpoo42"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-bold text-sm transition-transform duration-500 hover:rotate-[15deg] hover:text-[#363636]"
                    aria-label="Telegram"
                  >
                    TG
                  </a>
                </li>
              </ul>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-black transition-colors hover:text-[#363636]"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
