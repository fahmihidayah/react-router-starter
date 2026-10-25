import { BookOpenText, Calculator, Check, CheckCircle2, NotebookText } from 'lucide-react'
import * as m from '~/paraglide/messages.js'

function JournalEntry({
  icon: Icon,
  iconColor,
  iconBackground,
  title,
  observation,
  subject,
}: {
  icon: typeof BookOpenText
  iconColor: string
  iconBackground: string
  title: string
  observation: string
  subject: string
}) {
  return (
    <div className="flex gap-3.5 border-b border-[#E7EBF2] pb-5">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px]"
        style={{ color: iconColor, backgroundColor: iconBackground }}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <h3 className="text-sm font-bold text-[#233450]">{title}</h3>
        <p className="text-[11px] leading-relaxed text-[#7D899F] sm:text-xs">{observation}</p>
        <p className="text-[10px] font-bold" style={{ color: iconColor }}>
          {subject}
        </p>
      </div>
      <CheckCircle2 className="size-[18px] shrink-0 text-[#25A58E]" aria-hidden="true" />
    </div>
  )
}

export function ProgressStorySection() {
  const benefits = [
    m.landing_feature_profiles(),
    m.landing_feature_goals(),
    m.landing_feature_notes(),
  ]

  return (
    <section className="bg-[#F4F7FC]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-[30px] px-5 py-10 lg:flex-row lg:items-center lg:gap-20 lg:px-[72px] lg:py-16">
        <div className="w-full space-y-[18px] rounded-2xl border border-[#E0E6F0] bg-white p-[18px] shadow-[0_18px_45px_rgba(38,53,92,0.06)] lg:w-[570px] lg:shrink-0 lg:space-y-[22px] lg:p-[30px]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#233450] lg:text-xl">
              {m.landing_journal_title()}
            </h2>
            <NotebookText className="size-[23px] text-[#2F39A9]" aria-hidden="true" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.06em] text-[#8490A5]">
            {m.landing_journal_date()}
          </p>
          <JournalEntry
            icon={BookOpenText}
            iconColor="#2F39A9"
            iconBackground="#EDEFFE"
            title={m.landing_journal_reading_title()}
            observation={m.landing_journal_reading_observation()}
            subject={m.landing_journal_reading_subject()}
          />
          <JournalEntry
            icon={Calculator}
            iconColor="#2E6FA0"
            iconBackground="#E7F3F7"
            title={m.landing_journal_math_title()}
            observation={m.landing_journal_math_observation()}
            subject={m.landing_journal_math_subject()}
          />
          <div className="space-y-1.5 rounded-[10px] bg-[#EFF9F6] p-4">
            <p className="text-[10px] font-extrabold tracking-[0.08em] text-[#227B68]">
              {m.landing_journal_reflection_label()}
            </p>
            <p className="text-sm leading-relaxed text-[#346A60]">
              {m.landing_journal_reflection()}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[22px]">
          <p className="text-[11px] font-extrabold tracking-[0.11em] text-[#2F39A9]">
            {m.landing_features_eyebrow()}
          </p>
          <h2 className="max-w-[570px] text-[29px] leading-[1.2] font-extrabold tracking-[-0.7px] text-[#1D2B48] lg:text-[38px]">
            {m.landing_features_title()}
          </h2>
          <p className="max-w-[600px] text-sm leading-[1.75] text-[#6C7890] lg:text-base">
            {m.landing_features_description()}
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 text-[13px] text-[#3F516D] lg:text-sm"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-[#2E6FA0]" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
