import { Link } from 'react-router'
import * as m from '~/paraglide/messages.js'

interface BrandProps {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
      aria-label={m.landing_brand_name()}
    >
      <img
        src="/favicon.webp"
        alt=""
        aria-hidden="true"
        className={`shrink-0 rounded-xl ${compact ? 'size-[34px]' : 'size-[42px]'}`}
      />
      <span className="flex flex-col gap-0.5 leading-none">
        <span
          className={`font-extrabold tracking-[-0.6px] text-[#17233E] ${
            compact ? 'text-[17px]' : 'text-[21px]'
          }`}
        >
          {m.landing_brand_name()}
        </span>
        <span className="text-[11px] leading-none text-[#6C768B]">
          {m.landing_brand_endorsement()}
        </span>
      </span>
    </Link>
  )
}
