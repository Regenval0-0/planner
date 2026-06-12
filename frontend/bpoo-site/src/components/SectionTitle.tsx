interface Props {
  children: React.ReactNode
}

export default function SectionTitle({ children }: Props) {
  return (
    <div className="mb-[75px]">
      <p className="font-bold leading-[1.5]" style={{ fontSize: 'clamp(28px, 4vw, 46px)' }}>
        {children}
      </p>
      <div className="title-line mt-4" />
    </div>
  )
}
