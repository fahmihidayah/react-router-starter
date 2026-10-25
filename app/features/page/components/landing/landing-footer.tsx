import { Link } from 'react-router'
import * as m from '~/paraglide/messages.js'
import { Brand } from './brand'

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-[#6B768C] transition-colors hover:text-[#2F39A9]">
        {children}
      </Link>
    </li>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-[#E7EAF1] bg-[#F8FAFD]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.75fr_0.75fr] lg:px-[72px] lg:py-14">
        <div className="max-w-sm space-y-5 sm:col-span-2 lg:col-span-1">
          <Brand />
          <p className="text-sm leading-7 text-[#6C7890]">{m.landing_footer_tagline()}</p>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-[#273550]">{m.landing_footer_explore()}</h2>
          <ul className="mt-4 space-y-3">
            <FooterLink to="/">{m.landing_nav_home()}</FooterLink>
            <FooterLink to="/#features">{m.landing_nav_features()}</FooterLink>
            <FooterLink to="/#how-it-works">{m.landing_nav_how_it_works()}</FooterLink>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-[#273550]">{m.landing_footer_company()}</h2>
          <ul className="mt-4 space-y-3">
            <FooterLink to="/about">{m.landing_nav_about()}</FooterLink>
            <FooterLink to="/contact">{m.landing_nav_contact()}</FooterLink>
            <FooterLink to="/terms">{m.landing_nav_terms()}</FooterLink>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E1E6EE]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-5 text-xs text-[#8390A4] sm:flex-row sm:items-center sm:justify-between lg:px-[72px]">
          <p>{m.landing_footer_brand()}</p>
          <p>{m.landing_footer_copyright({ year: new Date().getFullYear().toString() })}</p>
        </div>
      </div>
    </footer>
  )
}
