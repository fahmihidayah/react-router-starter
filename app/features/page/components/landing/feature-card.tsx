import type { LucideIcon } from 'lucide-react'

export interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  detail: string
  accent: 'indigo' | 'blue' | 'mint' | 'cyan'
}

const accents = {
  indigo: {
    icon: 'bg-[#EEF0FF] text-[#2F39A9]',
    line: 'bg-[#2F39A9]',
  },
  blue: {
    icon: 'bg-[#EAF4FA] text-[#2E6FA0]',
    line: 'bg-[#2E6FA0]',
  },
  mint: {
    icon: 'bg-[#E7FAF6] text-[#178874]',
    line: 'bg-[#15B99A]',
  },
  cyan: {
    icon: 'bg-[#EAF8FA] text-[#2C8298]',
    line: 'bg-[#49A4BB]',
  },
} as const

export function FeatureCard({ icon: Icon, title, description, detail, accent }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#E1E6F0] bg-white p-6 shadow-[0_12px_32px_rgba(37,50,76,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,50,76,0.10)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${accents[accent].line}`} />
      <span
        className={`mb-6 flex size-12 items-center justify-center rounded-2xl ${accents[accent].icon}`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-extrabold text-[#1F2D49]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#69758C]">{description}</p>
      <p className="mt-5 border-t border-[#EBEEF4] pt-4 text-xs font-bold leading-5 text-[#4A5872]">
        {detail}
      </p>
    </article>
  )
}
