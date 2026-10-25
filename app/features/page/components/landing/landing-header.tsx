import { ArrowRight, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { HeaderUserMenu } from '~/components/layouts/header-user-menu'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import { Brand } from './brand'
import { LanguageToggle } from './language-toggle'

interface LandingHeaderProps {
  user?: {
    id: string
    name?: string | null
    email?: string
    image?: string | null
  } | null
}

function getNavItems() {
  return [
    { href: '/', label: m.landing_nav_home() },
    { href: '/#features', label: m.landing_nav_features() },
    { href: '/about', label: m.landing_nav_about() },
    { href: '/terms', label: m.landing_nav_terms() },
    { href: '/contact', label: m.landing_nav_contact() },
  ]
}

function HeaderLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return getNavItems().map((item) => {
    const isActive =
      item.href === '/'
        ? location.pathname === '/'
        : !item.href.includes('#') && location.pathname.endsWith(item.href)

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={onNavigate}
        className={cn(
          'text-sm font-semibold transition-colors hover:text-[#2F39A9]',
          isActive ? 'text-[#2F39A9]' : 'text-[#566079]',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.label}
      </Link>
    )
  })
}

function AccountActions({ user, mobile = false }: LandingHeaderProps & { mobile?: boolean }) {
  if (user) {
    return (
      <div className={cn('flex items-center gap-4', mobile && 'w-full flex-col items-stretch')}>
        <Link
          to="/track-app"
          className={cn(
            'text-sm font-bold text-[#25324C] transition-colors hover:text-[#2F39A9]',
            mobile && 'rounded-xl border border-[#D8DEEB] px-4 py-3 text-center',
          )}
        >
          {m.landing_dashboard()}
        </Link>
        <HeaderUserMenu
          user={user}
          dashboardPath="/track-app"
          settingsPath="/track-app/settings"
          mobile={mobile}
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-5', mobile && 'w-full flex-col items-stretch gap-3')}>
      <Link
        to="/login"
        className={cn(
          'text-sm font-bold text-[#25324C] transition-colors hover:text-[#2F39A9]',
          mobile && 'rounded-xl border border-[#D8DEEB] px-4 py-3 text-center',
        )}
      >
        {m.landing_sign_in()}
      </Link>
      <Link
        to="/register"
        className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#2F39A9] px-[22px] py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        {m.landing_get_started()}
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </Link>
    </div>
  )
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9ECF4] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-[18px] lg:px-[72px] lg:py-5">
        <Brand compact />

        <nav className="hidden items-center gap-5 xl:flex" aria-label={m.landing_main_navigation()}>
          <HeaderLinks />
        </nav>

        <div className="flex items-center gap-3 lg:gap-5">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <div className="hidden xl:block">
            <AccountActions user={user} />
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-[#25324C] xl:hidden"
                aria-label={m.landing_open_menu()}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,360px)] border-[#E1E6F0] p-0">
              <SheetTitle className="sr-only">{m.landing_main_navigation()}</SheetTitle>
              <div className="flex h-full flex-col px-6 py-7">
                <Brand compact />
                <nav className="mt-10 flex flex-col gap-6" aria-label={m.landing_main_navigation()}>
                  <HeaderLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
                <div className="mt-auto space-y-6 border-t border-[#E6EAF2] pt-6">
                  <LanguageToggle />
                  <AccountActions user={user} mobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
