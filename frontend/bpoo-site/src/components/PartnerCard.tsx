interface Props {
  name: string
  href: string
}

export default function PartnerCard({ name, href }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="card-original block p-5 text-center transition-colors duration-500 hover:bg-[#f0f0f0]"
    >
      <p className="text-sm font-medium text-black">{name}</p>
    </a>
  )
}
