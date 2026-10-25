import { CheckCircle2, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as m from '~/paraglide/messages.js'

const chartHeights = [35, 53, 44, 73, 63, 89, 104]

function LearningSummary() {
  const metrics = [
    { value: '4', label: m.landing_preview_active_goals(), color: '#2F39A9' },
    { value: '12', label: m.landing_preview_learning_notes(), color: '#2E6FA0' },
    {
      value: m.landing_preview_days_value(),
      label: m.landing_preview_consistency(),
      color: '#168474',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0 rounded-lg bg-[#F4F6FC] p-2.5 sm:p-3.5">
          <strong
            className="block text-xl font-extrabold sm:text-2xl"
            style={{ color: metric.color }}
          >
            {metric.value}
          </strong>
          <span className="mt-1 block truncate text-[8px] text-[#6A7690] sm:text-[10px]">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActivityChart() {
  const days = [
    m.landing_preview_day_mon(),
    m.landing_preview_day_tue(),
    m.landing_preview_day_wed(),
    m.landing_preview_day_thu(),
    m.landing_preview_day_fri(),
    m.landing_preview_day_sat(),
    m.landing_preview_day_sun(),
  ]

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold text-[#283653] sm:text-xs">
          {m.landing_preview_chart_title()}
        </p>
        <p className="shrink-0 text-[10px] text-[#8790A3]">{m.landing_preview_chart_period()}</p>
      </div>
      <div className="grid grid-cols-7 gap-2.5 sm:gap-[18px]">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center gap-2">
            <div className="flex h-[108px] w-full items-end">
              <span
                className="w-full rounded-t-[5px]"
                style={{
                  height: chartHeights[index],
                  backgroundColor: index === days.length - 1 ? '#15D8B3' : '#CDD3F5',
                }}
              />
            </div>
            <span className="text-[10px] text-[#8590A4]">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProgressPreview() {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="overflow-hidden rounded-[18px] border border-[#DDE3F1] bg-white shadow-[0_24px_55px_rgba(38,53,92,0.08)]">
        <div className="flex items-center justify-between border-b border-[#E7EBF3] px-4 py-3.5 sm:px-[22px] sm:py-[18px]">
          <span className="text-[13px] font-bold text-[#253452]">
            {m.landing_preview_workspace()}
          </span>
          <MoreHorizontal className="size-5 text-[#768299]" aria-hidden="true" />
        </div>

        <div className="space-y-[18px] p-4 sm:space-y-[22px] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8EBFC] text-lg font-extrabold text-[#2F39A9] sm:size-11">
              A
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-bold text-[#1B2844] sm:text-base">
                {m.landing_preview_learner()}
              </strong>
              <span className="mt-1 block text-[11px] text-[#7A8498]">
                {m.landing_preview_period()}
              </span>
            </span>
            <ChevronDown className="size-4 text-[#7A8498]" aria-hidden="true" />
          </div>

          <LearningSummary />
          <ActivityChart />

          <div className="space-y-2.5 rounded-[10px] border border-[#E5EAF4] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[10px] font-bold text-[#283653] sm:text-xs">
                {m.landing_preview_goal()}
              </span>
              <span className="shrink-0 text-[9px] font-bold text-[#2F39A9] sm:text-[11px]">
                {m.landing_preview_goal_progress()}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E9EDF7]">
              <div className="h-full w-[70%] rounded-full bg-[#2F39A9]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl bg-[#E9F8F4] p-3 text-[11px] font-semibold text-[#236859] sm:gap-3 sm:px-5 sm:py-3.5 sm:text-xs">
        <CheckCircle2 className="size-[23px] shrink-0 text-[#17816E]" aria-hidden="true" />
        <span>{m.landing_preview_encouragement()}</span>
      </div>
    </div>
  )
}
