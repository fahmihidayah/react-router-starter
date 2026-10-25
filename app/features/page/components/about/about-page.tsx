import { CalendarCheck2, HeartHandshake, NotebookPen, Target, TimerReset } from 'lucide-react'
import * as m from '~/paraglide/messages.js'
import { PublicPageHero } from '../shared/public-page-hero'
import { SectionHeading } from '../shared/section-heading'
import { AboutValueCard } from './about-value-card'

export function AboutPageContent() {
  const capabilities = [
    {
      icon: CalendarCheck2,
      title: m.about_capability_schedule_title(),
      description: m.about_capability_schedule_description(),
    },
    {
      icon: TimerReset,
      title: m.about_capability_focus_title(),
      description: m.about_capability_focus_description(),
    },
    {
      icon: Target,
      title: m.about_capability_goals_title(),
      description: m.about_capability_goals_description(),
    },
    {
      icon: NotebookPen,
      title: m.about_capability_records_title(),
      description: m.about_capability_records_description(),
    },
  ]

  return (
    <div className="bg-white">
      <PublicPageHero
        icon={HeartHandshake}
        eyebrow={m.about_eyebrow()}
        title={m.about_title()}
        description={m.about_description()}
      />

      <section className="mx-auto grid max-w-[1120px] gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow={m.about_mission_eyebrow()}
          title={m.about_mission_title()}
          description={m.about_mission_description()}
        />
        <div className="space-y-5 text-sm leading-8 text-[#5F6D85] sm:text-base">
          <p>{m.about_story_first()}</p>
          <p>{m.about_story_second()}</p>
        </div>
      </section>

      <section className="bg-[#F5F7FC]">
        <div className="mx-auto max-w-[1120px] px-5 py-14 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow={m.about_product_eyebrow()}
            title={m.about_product_title()}
            description={m.about_product_description()}
            centered
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <AboutValueCard key={capability.title} {...capability} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-14 text-center lg:px-8 lg:py-20">
        <SectionHeading
          eyebrow={m.about_belief_eyebrow()}
          title={m.about_belief_title()}
          description={m.about_belief_description()}
          centered
        />
      </section>
    </div>
  )
}
