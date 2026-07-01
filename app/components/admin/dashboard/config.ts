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
        url: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
      },
      {
        title: 'Media',
        url: '/admin/media',
        icon: Image,
      },
      {
        title: 'Categories',
        url: '/admin/categories',
        icon: SquaresUnite,
      },
      {
        title: 'Tags',
        url: '/admin/tags',
        icon: Tags,
      },

      {
        title: 'Posts',
        url: '/admin/posts',
        icon: FileText,
      },
      {
        title: 'Settings',
        url: '/admin/settings',
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
