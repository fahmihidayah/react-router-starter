import { ChartNoAxesCombined, NotebookPen, Target, UserRoundPlus } from 'lucide-react'
import * as m from '~/paraglide/messages.js'

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: UserRoundPlus,
      title: m.landing_step_profile_title(),
      description: m.landing_step_profile_description(),
    },
    {
      number: '02',
      icon: Target,
      title: m.landing_step_goal_title(),
      description: m.landing_step_goal_description(),
    },
    {
      number: '03',
      icon: NotebookPen,
      title: m.landing_step_log_title(),
      description: m.landing_step_log_description(),
    },
    {
      number: '04',
      icon: ChartNoAxesCombined,
      title: m.landing_step_review_title(),
      description: m.landing_step_review_description(),
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[1440px] space-y-8 px-6 py-12 lg:space-y-[42px] lg:px-[72px] lg:py-20">
        <div className="space-y-3.5">
          <p className="text-[11px] font-extrabold tracking-[0.11em] text-[#2F39A9]">
            {m.landing_steps_eyebrow()}
          </p>
          <h2 className="text-[29px] leading-tight font-extrabold tracking-[-0.7px] text-[#17233E] lg:text-4xl">
            {m.landing_steps_title()}
          </h2>
          <p className="text-sm text-[#6C7890] lg:text-base">{m.landing_steps_description()}</p>
        </div>

        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article key={number} className="space-y-[18px]">
              <div className="flex items-center justify-between border-b border-[#E8EBF2] pb-[18px]">
                <Icon className="size-7 text-[#2F39A9]" aria-hidden="true" />
                <span className="text-xs font-bold text-[#99A5BA]">{number}</span>
              </div>
              <h3 className="text-lg font-bold text-[#24334F]">{title}</h3>
              <p className="text-sm leading-[1.7] text-[#6C7890]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
