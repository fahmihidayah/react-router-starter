export function PrivacySection({
  number,
  title,
  content,
}: {
  number: string
  title: string
  content: string
}) {
  return (
    <section className="grid gap-3 border-b border-[#E6EAF1] py-7 last:border-0 sm:grid-cols-[3rem_1fr] sm:gap-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#EEF0FF] text-xs font-extrabold text-[#2F39A9]">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-extrabold text-[#22314D]">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#68758B] sm:text-base sm:leading-8">
          {content}
        </p>
      </div>
    </section>
  )
}
