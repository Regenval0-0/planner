import SectionTitle from '../components/SectionTitle.tsx'
import PartnerCard from '../components/PartnerCard.tsx'

const partners = [
  { name: 'Министерство труда и занятости населения Кузбасса', href: 'https://firpo.ru/' },
  { name: 'Министерство социальной защиты населения Кузбасса', href: 'http://dsznko.ru/' },
  { name: 'Министерство культуры и национальной политики Кузбасса', href: 'https://mincult-kuzbass.ru/' },
  { name: 'Министерство физической культуры и спорта Кузбасса', href: 'https://minsport-kuzbass.ru/' },
  { name: 'Кемеровская областная организация ВОИ', href: 'https://www.voi.ru/o_nas/regionalnye_organizaci/oblasti_rf/kemerovskaya_oblast' },
  { name: 'Кузбасский региональный центр «Здоровье и развитие личности»', href: 'https://kuzrc.ru/' },
  { name: 'Главное бюро МСЭ по Кемеровской области', href: 'https://42.gbmse.ru/' },
  { name: 'ЦОПП Сибирского политехнического техникума', href: 'https://copp.ruobr.ru/' },
  { name: 'Кемеровский государственный университет', href: 'https://www.kemsu.ru/' },
  { name: 'ВОРДИ Кемеровской области', href: 'http://kemerovo.vordi.org/' },
  { name: 'КемОО ВОИ', href: 'http://kemoovos.ru/' },
  { name: 'Российский Красный Крест (Новокузнецк)', href: 'https://www.kemredcross.ru/' },
  { name: 'Служба лечебной педагогики', href: 'https://vk.com/slp_42' },
  { name: 'Абилимпикс Кузбасс', href: 'https://abilympics-kuzbass.ru/' },
  { name: 'Кузбасская ГСХА', href: 'https://www.ksai.ru/' },
  { name: 'Центр ОВР Кузбасса', href: 'https://kuzdrav.ru/' },
]

export default function PartnersSection() {
  return (
    <section id="partners" className="relative z-10">
      <div className="section-container">
        <SectionTitle>Партнёры</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((p, i) => (
            <PartnerCard key={i} name={p.name} href={p.href} />
          ))}
        </div>
      </div>
    </section>
  )
}
