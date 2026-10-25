import type { LucideIcon } from 'lucide-react'

export function AboutValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <article className="rounded-2xl border border-[#E1E6F0] bg-white p-6 shadow-[0_12px_30px_rgba(37,50,76,0.05)]">
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#2F39A9]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-extrabold text-[#22314D]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6B778D]">{description}</p>
    </article>
  )
}
