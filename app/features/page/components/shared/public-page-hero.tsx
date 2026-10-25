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
    <section className="relative overflow-hidden border-b border-border bg-linear-to-br from-background via-primary-soft to-brand-mint-soft">
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-brand-mint/15 blur-3xl" />
      <div className="relative mx-auto max-w-[1120px] px-5 py-14 text-center sm:py-18 lg:px-8 lg:py-24">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-brand">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[11px] font-extrabold tracking-[0.14em] text-primary">{eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-[36px] leading-[1.15] font-extrabold tracking-[-1.2px] text-foreground sm:text-5xl lg:text-[56px]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
          {description}
        </p>
      </div>
    </section>
  )
}
