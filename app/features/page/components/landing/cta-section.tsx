import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import * as m from '~/paraglide/messages.js'

export function CtaSection() {
  return (
    <section className="bg-[#2F39A9] text-center text-white">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center gap-[22px] px-6 py-12 lg:px-20 lg:py-[68px]">
        <p className="text-[11px] font-bold tracking-[0.12em] text-[#ACF3E5]">
          {m.landing_cta_eyebrow()}
        </p>
        <h2 className="text-[32px] leading-[1.18] font-extrabold tracking-[-0.8px] lg:text-[40px]">
          {m.landing_cta_title()}
        </h2>
        <p className="max-w-[680px] text-sm leading-[1.7] text-[#D9DEF9] lg:text-base">
          {m.landing_cta_description()}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3.5">
          <Link
            to="/register"
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[10px] bg-[#15D8B3] px-[22px] py-4 text-sm font-bold text-[#173B44] transition-transform hover:-translate-y-0.5"
          >
            {m.landing_cta_create_account()}
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-white px-[22px] py-4 text-sm font-bold text-[#26344F] transition-transform hover:-translate-y-0.5"
          >
            {m.landing_sign_in()}
          </Link>
        </div>
      </div>
    </section>
  )
}
