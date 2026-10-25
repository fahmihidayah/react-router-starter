export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow ? (
        <p className="text-[11px] font-extrabold tracking-[0.13em] text-[#2F39A9]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-2xl leading-tight font-extrabold tracking-[-0.5px] text-[#1D2B48] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-7 text-[#68758D] sm:text-base">{description}</p>
      ) : null}
    </div>
  )
}
