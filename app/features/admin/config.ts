import * as LucideReact from 'lucide-react'
import type { AdminConfig } from './types/admin-config'

export const Config: AdminConfig = {
  title: 'Blog',
  menus: [
    {
      slug: '/',
      label: 'Dashboard',
      icon: LucideReact.Home,
    },
    {
      slug: 'users',
      icon: LucideReact.Users,
    },
    {
      slug: 'roles',
      icon: LucideReact.ShieldCheck,
    },
    {
      slug: 'media',
      icon: LucideReact.Images,
    },
    {
      slug: 'posts',
      icon: LucideReact.File,
    },
    {
      slug: 'categories',
      icon: LucideReact.File,
    },
  ],
}
