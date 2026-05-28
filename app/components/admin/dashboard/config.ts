import {
  FileText,
  Home,
  Image,
  LayoutDashboard,
  Settings,
  SquaresUnite,
  Tags,
  Users,
} from 'lucide-react'
import type { SidebarHeaderConfig } from './sidebar-header'
import type { NavigationGroup } from './sidebar-navigation'

// Default header configuration
export const defaultHeaderConfig: SidebarHeaderConfig = {
  appName: 'App Starter',
  appInitial: 'AS',
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
        title: 'Tags',
        url: '/dashboard/tags',
        icon: Tags,
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
