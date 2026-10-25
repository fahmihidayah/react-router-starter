import * as m from '~/paraglide/messages.js'

export function FaqSection() {
  const faqs = [
    {
      question: m.landing_faq_audience_question(),
      answer: m.landing_faq_audience_answer(),
    },
    {
      question: m.landing_faq_free_question(),
      answer: m.landing_faq_free_answer(),
    },
    {
      question: m.landing_faq_tracking_question(),
      answer: m.landing_faq_tracking_answer(),
    },
  ]

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-[30px] px-6 py-12 lg:flex-row lg:gap-[60px] lg:py-20">
        <div className="space-y-3.5 lg:w-[360px] lg:shrink-0">
          <p className="text-[11px] font-extrabold tracking-[0.11em] text-[#2F39A9]">
            {m.landing_faq_eyebrow()}
          </p>
          <h2 className="max-w-[330px] text-[29px] leading-[1.18] font-extrabold tracking-[-0.7px] text-[#17233E] lg:text-[34px]">
            {m.landing_faq_title()}
          </h2>
        </div>

        <div className="flex-1 space-y-6">
          {faqs.map((faq) => (
            <article key={faq.question} className="space-y-2.5 border-b border-[#E8EBF2] pb-[22px]">
              <h3 className="text-[15px] font-bold text-[#283654] lg:text-base">{faq.question}</h3>
              <p className="text-sm leading-[1.7] text-[#707C92]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
