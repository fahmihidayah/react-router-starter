import { CalendarCheck2, ListChecks, Target, TimerReset } from 'lucide-react'
import * as m from '~/paraglide/messages.js'
import { FeatureCard, type FeatureCardProps } from './feature-card'

export function FeatureShowcaseSection() {
  const features: FeatureCardProps[] = [
    {
      icon: CalendarCheck2,
      title: m.landing_feature_schedule_title(),
      description: m.landing_feature_schedule_description(),
      detail: m.landing_feature_schedule_detail(),
      accent: 'indigo',
    },
    {
      icon: TimerReset,
      title: m.landing_feature_pomodoro_title(),
      description: m.landing_feature_pomodoro_description(),
      detail: m.landing_feature_pomodoro_detail(),
      accent: 'mint',
    },
    {
      icon: Target,
      title: m.landing_feature_goals_title(),
      description: m.landing_feature_goals_description(),
      detail: m.landing_feature_goals_detail(),
      accent: 'blue',
    },
    {
      icon: ListChecks,
      title: m.landing_feature_activity_title(),
      description: m.landing_feature_activity_description(),
      detail: m.landing_feature_activity_detail(),
      accent: 'cyan',
    },
  ]

  return (
    <section id="features" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 lg:px-[72px] lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-extrabold tracking-[0.13em] text-[#2F39A9]">
            {m.landing_capabilities_eyebrow()}
          </p>
          <h2 className="mt-4 text-[30px] leading-tight font-extrabold tracking-[-0.8px] text-[#17233E] lg:text-[42px]">
            {m.landing_capabilities_title()}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6C7890] lg:text-base">
            {m.landing_capabilities_description()}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
