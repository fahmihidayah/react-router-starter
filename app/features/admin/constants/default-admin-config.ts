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
import type { SidebarHeader } from '../types/sidebar-header'
import type { SidebarNavigationGroup } from '../types/sidebar-navigation'

// Default header configuration
export const defaultHeaderConfig: SidebarHeader = {
  appName: 'App Starter',
  appInitial: 'AS',
  subtitle: 'Dashboard',
}

// Default navigation groups
export const defaultNavigationGroups: SidebarNavigationGroup[] = [
  {
    slug: 'navigation',
    label: 'Navigation',
    items: [
      {
        slug: 'admin',
        label: 'Overview',
        url: '/admin',
        icon: LayoutDashboard,
      },
      {
        slug: 'users',
        label: 'Users',
        url: '/admin/users',
        icon: Users,
      },
      {
        slug: 'media',
        label: 'Media',
        url: '/admin/media',
        icon: Image,
      },
      {
        slug: 'categories',
        label: 'Categories',
        url: '/admin/categories',
        icon: SquaresUnite,
      },
      {
        slug: 'tags',
        label: 'Tags',
        url: '/admin/tags',
        icon: Tags,
      },

      {
        slug: 'posts',
        label: 'Posts',
        url: '/admin/posts',
        icon: FileText,
      },
      {
        slug: 'settings',
        label: 'Settings',
        url: '/admin/settings',
        icon: Settings,
      },
    ],
  },
  {
    slug: 'quick-links',
    label: 'Quick Links',
    items: [
      {
        slug: 'home',
        label: 'Home',
        url: '/',
        icon: Home,
      },
    ],
  },
]
