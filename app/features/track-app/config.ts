import { CalendarCheck2, LayoutDashboard, LibraryBig, Settings, UsersRound } from 'lucide-react'
import type { AdminConfig } from '~/features/admin/types/admin-config'

export const Config: AdminConfig = {
  title: 'Catat Progress',
  subTitle: 'by temanraih.id',
  menus: [
    {
      slug: 'dashboard',
      url: '/track-app',
      icon: LayoutDashboard,
    },
    {
      slug: 'learners',
      url: '/track-app/learners',
      icon: UsersRound,
    },
    {
      slug: 'schedule',
      url: '/track-app/schedule',
      icon: CalendarCheck2,
    },
    {
      slug: 'learning-templates',
      url: '/track-app/learning-templates',
      icon: LibraryBig,
    },
    {
      slug: 'settings',
      url: '/track-app/settings',
      icon: Settings,
    },
  ],
}
