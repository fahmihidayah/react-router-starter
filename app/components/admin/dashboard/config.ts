import {
  Home,
  Image,
  LayoutDashboard,
  Settings,
  SquaresUnite,
  Users,
  FileText,
  UsersRound,
  Tags,
  CalendarDays,
  Banknote,
  Beef,
} from 'lucide-react'
import type { SidebarHeaderConfig } from './sidebar-header'
import type { NavigationGroup } from './sidebar-navigation'

// Default header configuration
export const defaultHeaderConfig: SidebarHeaderConfig = {
  appName: 'Mosque Management',
  appInitial: 'M',
  subtitle: 'Dashboard',
}

// Default navigation groups
export const defaultNavigationGroups: NavigationGroup[] = [
  {
    label: 'Navigation',
    items: [
      {
        title: 'Overview',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: Users,
      },
      {
        title: 'Media',
        url: '/dashboard/media',
        icon: Image,
      },
      {
        title: 'Categories',
        url: '/dashboard/categories',
        icon: SquaresUnite,
      },
      {
        title: 'Posts',
        url: '/dashboard/posts',
        icon: FileText,
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
  {
    label: 'Mosque Management',
    items: [
      {
        title: 'Congregations',
        url: '/dashboard/congregations',
        icon: UsersRound,
      },
      {
        title: 'Tags',
        url: '/dashboard/tags',
        icon: Tags,
      },
      {
        title: 'Events',
        url: '/dashboard/events',
        icon: CalendarDays,
      },
      {
        title: 'Transactions',
        url: '/dashboard/transactions',
        icon: Banknote,
      },
      {
        title: 'Qurban',
        url: '/dashboard/qurban',
        icon: Beef,
      },
    ],
  },
  {
    label: 'Quick Links',
    items: [
      {
        title: 'Home',
        url: '/',
        icon: Home,
      },
    ],
  },
]
