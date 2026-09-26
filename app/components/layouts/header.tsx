import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
import { HeaderLogo } from './header-logo'
import { HeaderAuth } from './header-auth'
import { HeaderUserMenu } from './header-user-menu'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'

interface HeaderProps {
  user?: {
    id: string
    name?: string | null
    email?: string
    image?: string | null
  } | null
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/posts', label: 'Articles' },
] as const

function NavLinks({ onClick }: { onClick?: () => void }) {
  const location = useLocation()

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.to

        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </>
  )
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <HeaderLogo />

        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? <HeaderUserMenu user={user} /> : <HeaderAuth />}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <div className="flex flex-col gap-6 pt-8">
              <nav className="flex flex-col gap-4">
                <NavLinks onClick={closeMobile} />
              </nav>
              <Separator />
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/admin" onClick={closeMobile}>
                        Dashboard
                      </Link>
                    </Button>
                    <HeaderUserMenu user={user} mobile onLogout={closeMobile} />
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={closeMobile}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register" onClick={closeMobile}>
                        Get Started
                      </Link>
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
