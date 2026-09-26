import type { LucideIcon } from 'lucide-react'

export type SidebarNavigationItem = {
  slug: string
  label: string
  url: string
  icon?: LucideIcon
}

export type SidebarNavigationGroup = {
  slug: string
  label: string
  items: SidebarNavigationItem[]
}
