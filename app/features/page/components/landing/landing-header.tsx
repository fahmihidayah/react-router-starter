import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { HeaderUserMenu } from '~/components/layouts/header-user-menu'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'
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

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return NAV_ITEMS.map((item) => {
    const isActive =
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {item.label}
      </Link>
    )
  })
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Brand compact />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {user ? (
            <HeaderUserMenu user={user} dashboardPath="/account" settingsPath="/account/settings" />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <div className="flex h-full flex-col gap-6 pt-8">
              <nav className="flex flex-col gap-4" aria-label="Main navigation">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <LanguageToggle />
              <div className="mt-auto flex flex-col gap-3">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/account">Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/account/settings">Settings</Link>
                    </Button>
                    <HeaderUserMenu
                      user={user}
                      mobile
                      onLogout={() => setOpen(false)}
                      settingsPath="/account/settings"
                    />
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register">Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
