import { User2 } from 'lucide-react'
import { useNavigate } from 'react-router'
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
}

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg">
          <User2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
