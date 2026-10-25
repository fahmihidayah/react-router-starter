import * as LucideReact from 'lucide-react'
import type { AdminConfig } from './types/admin-config'
import type { UserAdmin } from './types/user'

function isNotAdmin(user: UserAdmin): boolean {
  return !user.roles?.includes('admin')
}

export const Config: AdminConfig = {
  title: 'Admin',
  menus: [
    {
      slug: '/',
      label: 'Dashboard',
      icon: LucideReact.Home,
    },
    {
      slug: 'users',
      icon: LucideReact.Users,
      hide: isNotAdmin,
    },
    {
      slug: 'roles',
      icon: LucideReact.ShieldCheck,
      hide: isNotAdmin,
    },
    {
      slug: 'media',
      icon: LucideReact.Images,
      hide: isNotAdmin,
    },
    {
      slug: 'posts',
      label: 'Posts',
      icon: LucideReact.File,
      hide: isNotAdmin,
    },
    {
      slug: 'categories',
      label: 'Categories',
      icon: LucideReact.File,
      hide: isNotAdmin,
    },
  ],
}
