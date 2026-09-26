import { User2, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useNavigate, Link } from 'react-router'
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
}

export function HeaderUserMenu({ user, mobile = false, onLogout }: HeaderUserMenuProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    onLogout?.()
    navigate('/')
  }

  if (mobile) {
    return (
      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="size-4" />
        Logout
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg">
          <User2 className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
