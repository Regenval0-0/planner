export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-end overflow-hidden"
      style={{ backgroundColor: '#fcdd51' }}
    >
      <div
        className="relative flex items-end justify-end"
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* White panel like original */}
        <div
          className="flex flex-col justify-end pb-[15vh] pr-[5vw]"
          style={{
            width: '65%',
            minHeight: '100vh',
            backgroundColor: '#fff',
            borderLeft: '2px solid #c7c7c7',
            borderTopLeftRadius: '70%',
            paddingLeft: '5vw',
          }}
        >
          <div style={{ width: '80%' }}>
            <h1
              className="font-bold text-black text-left mb-4"
              style={{ fontSize: 'clamp(18px, 2vw, 32px)' }}
            >
              Головная базовая профессиональная образовательная организация
            </h1>
            <h2
              className="font-bold text-black text-left mb-6"
              style={{ fontSize: 'clamp(18px, 2vw, 32px)' }}
            >
              обеспечивающая поддержку региональной системы инклюзивного профессионального образования инвалидов и лиц с ОВЗ в Кемеровской области — Кузбассе
            </h2>
            <p
              className="text-left text-black"
              style={{ fontSize: 'clamp(14px, 1.35vw, 20px)', marginTop: 30 }}
            >
              Цель БПОО — координация развития инклюзивного СПО и ПО в Кемеровской области — Кузбассе, разработка и внедрение региональной модели сетевого взаимодействия с ПОО Кемеровской области — Кузбасса, а также иными заинтересованными организациями для обеспечения условий доступности получения СПО и ПО для инвалидов и лиц с ОВЗ.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
