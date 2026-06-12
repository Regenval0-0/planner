const navItems = [
  { label: 'Основные сведения', href: '#basic-information' },
  { label: 'Образование', href: '#education' },
  { label: 'Профориентация', href: '#career' },
  { label: 'Мероприятия', href: '#events' },
  { label: 'Партнёры', href: '#partners' },
  { label: 'Доступная среда', href: '#accessibility' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      id="mobile-menu"
      className="lg:hidden fixed inset-x-0 top-[80px] bottom-0 z-[9997] overflow-y-auto"
      style={{ backgroundColor: '#fcdd51' }}
    >
      <nav aria-label="Мобильная навигация" className="p-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="block px-4 py-3 text-base font-medium text-black hover:text-[#363636] transition-colors"
          >
            {item.label}
          </a>
        ))}

        <div className="pt-4 border-t border-black/20 space-y-3">
          <a
            href="https://vk.com/bpoo42"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-black hover:text-[#363636]"
          >
            ВКонтакте
          </a>
          <a
            href="https://t.me/bpoo42"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-black hover:text-[#363636]"
          >
            Telegram
          </a>
        </div>
      </nav>
    </div>
  )
}
