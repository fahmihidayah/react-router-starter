export function TermsSection({
  number,
  title,
  content,
}: {
  number: string
  title: string
  content: string
}) {
  return (
    <section className="grid gap-3 border-b border-border py-7 last:border-0 sm:grid-cols-[3rem_1fr] sm:gap-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-xs font-extrabold text-primary">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
          {content}
        </p>
      </div>
    </section>
  )
}
