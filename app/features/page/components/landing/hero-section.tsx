import { ArrowRight, CalendarDays, Clock3, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import * as m from '~/paraglide/messages.js'
import { ProgressPreview } from './progress-preview'

export function HeroSection() {
  const highlights = [
    { icon: CalendarDays, label: m.landing_feature_schedule_title() },
    { icon: Clock3, label: m.landing_feature_pomodoro_title() },
    { icon: Target, label: m.landing_feature_goals_title() },
    { icon: TrendingUp, label: m.landing_feature_activity_title() },
  ]

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(135deg,#F8FAFF_0%,#EEF1FF_48%,#ECFBF8_100%)]"
      aria-labelledby="landing-title"
    >
      <div className="absolute -top-28 right-[8%] size-80 rounded-full bg-[#15D8B3]/10 blur-3xl" />
      <div className="absolute -bottom-40 left-[6%] size-96 rounded-full bg-[#2F39A9]/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-5 py-12 lg:flex-row lg:gap-[54px] lg:px-[72px] lg:pb-20 lg:pt-20">
        <div className="flex w-full flex-col gap-[22px] lg:w-[558px] lg:shrink-0 lg:gap-[26px]">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#2F39A9] sm:text-[13px]">
            <Sparkles className="size-[18px] shrink-0" aria-hidden="true" />
            <span>{m.landing_hero_eyebrow()}</span>
          </div>

          <h1
            id="landing-title"
            className="text-[40px] leading-[1.12] font-extrabold tracking-[-1.8px] text-[#182344] sm:text-5xl lg:text-[58px] lg:leading-[1.08]"
          >
            {m.landing_hero_title()}
          </h1>

          <p className="max-w-[540px] text-[15px] leading-[1.8] text-[#647089] lg:text-[17px]">
            {m.landing_hero_description()}
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <Link
              to="/register"
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[10px] bg-[#2F39A9] px-[22px] py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              {m.landing_hero_primary_action()}
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[#D8DEEB] bg-white px-[22px] py-4 text-sm font-bold text-[#26344F] transition-colors hover:border-[#2F39A9]/40"
            >
              {m.landing_hero_secondary_action()}
            </a>
          </div>

          <p className="text-[11px] leading-relaxed text-[#748098]">
            {m.landing_hero_trust_note()}
          </p>

          <ul className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4 lg:grid-cols-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 text-xs font-bold text-[#40506C] shadow-sm backdrop-blur"
              >
                <Icon className="size-4 shrink-0 text-[#2F39A9]" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <ProgressPreview />
      </div>
    </section>
  )
}
