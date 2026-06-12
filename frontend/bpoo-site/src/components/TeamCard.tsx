interface Props {
  name: string
  role: string
}

export default function TeamCard({ name, role }: Props) {
  return (
    <div className="card-original p-6 text-center transition-colors duration-300 hover:bg-[#f0f0f0]">
      <div className="w-20 h-20 mx-auto mb-4 bg-[#e4e4e4] rounded-full flex items-center justify-center text-black text-2xl font-bold">
        {name.charAt(0)}
      </div>
      <h3 className="text-lg font-semibold text-black mb-1">{name}</h3>
      <p className="text-sm text-[#363636]">{role}</p>
    </div>
  )
}
