import { GraduationCap, HeartHandshake, School, UserRound } from 'lucide-react'
import * as m from '~/paraglide/messages.js'

export function AudienceStrip() {
  const audiences = [
    { icon: HeartHandshake, label: m.landing_audience_parent() },
    { icon: School, label: m.landing_audience_teacher() },
    { icon: UserRound, label: m.landing_audience_tutor() },
    { icon: GraduationCap, label: m.landing_audience_student() },
  ]

  return (
    <section id="audience" className="border-b border-[#E9ECF4] bg-white scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-6 lg:flex lg:items-center lg:gap-10 lg:px-[72px] lg:py-7">
        <p className="mb-4 text-sm text-[#7A8497] lg:mb-0 lg:shrink-0">
          {m.landing_audience_intro()}
        </p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:flex lg:flex-1 lg:gap-10">
          {audiences.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-w-0 items-center gap-2 lg:flex-1 lg:gap-2.5">
              <Icon className="size-[21px] shrink-0 text-[#627590]" aria-hidden="true" />
              <span className="truncate text-[11px] font-bold text-[#384A66] sm:text-[13px] lg:text-[15px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
