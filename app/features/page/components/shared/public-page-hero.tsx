import type { LucideIcon } from 'lucide-react'

export function PublicPageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#E6EAF2] bg-[linear-gradient(135deg,#F8FAFF_0%,#F0F3FF_52%,#ECFBF8_100%)]">
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-[#15D8B3]/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1120px] px-5 py-14 text-center sm:py-18 lg:px-8 lg:py-24">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#2F39A9] shadow-[0_12px_30px_rgba(47,57,169,0.12)]">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[11px] font-extrabold tracking-[0.14em] text-[#2F39A9]">
          {eyebrow}
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-[36px] leading-[1.15] font-extrabold tracking-[-1.2px] text-[#17233E] sm:text-5xl lg:text-[56px]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#657189] sm:text-base sm:leading-8">
          {description}
        </p>
      </div>
    </section>
  )
}
