import { LayoutDashboard, LogOut, Settings, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { signOut } from '~/lib/auth-client'
import * as m from '~/paraglide/messages.js'

interface User {
  id: string
  name?: string | null
  email?: string
  image?: string | null
}

interface HeaderUserMenuProps {
  user: User
  mobile?: boolean
  onLogout?: () => void
  dashboardPath?: string | null
  settingsPath?: string
  logoutRedirect?: string
  showUserInfo?: boolean
}

export function HeaderUserMenu({
  user,
  mobile = false,
  onLogout,
  dashboardPath = '/admin',
  settingsPath = '/admin/settings',
  logoutRedirect = '/',
  showUserInfo = false,
}: HeaderUserMenuProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    onLogout?.()
    navigate(logoutRedirect)
  }

  if (mobile) {
    return (
      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="size-4" />
        {m.user_menu_logout()}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={showUserInfo ? 'h-auto gap-2 px-2 py-1.5' : undefined}
          variant={showUserInfo ? 'ghost' : 'outline'}
          size={showUserInfo ? 'default' : 'lg'}
        >
          {showUserInfo ? (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-40 truncate text-sm font-medium">{user.name}</span>
                <span className="block max-w-40 truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </span>
            </>
          ) : (
            <User2 className="size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardPath && (
          <DropdownMenuItem asChild>
            <Link to={dashboardPath}>
              <LayoutDashboard className="size-4" />
              {m.user_menu_dashboard()}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to={settingsPath}>
            <Settings className="size-4" />
            {m.user_menu_settings()}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="size-4" />
          {m.user_menu_logout()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
