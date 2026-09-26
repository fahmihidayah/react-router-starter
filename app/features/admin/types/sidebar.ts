import type { SidebarHeader } from './sidebar-header'
import type { SidebarNavigationGroup } from './sidebar-navigation'

export type Sidebar = {
  header: SidebarHeader
  sideBarGroups: SidebarNavigationGroup[]
}
