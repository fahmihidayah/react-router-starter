import { HeaderLogo } from './header-logo'
import { HeaderAuth } from './header-auth'
import { HeaderUserMenu } from './header-user-menu'

interface HeaderProps {
  user?: {
    id: string
    name?: string | null
    email?: string
    image?: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <HeaderLogo />
        {user ? <HeaderUserMenu user={user} /> : <HeaderAuth />}
      </div>
    </nav>
  )
}
