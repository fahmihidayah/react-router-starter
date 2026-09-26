import type { UserWithRoles } from '~/features/users/types'
import type { AdminConfig } from '../types/admin-config'
import type { SidebarHeader } from '../types/sidebar-header'
import type { SidebarNavigationGroup, SidebarNavigationItem } from '../types/sidebar-navigation'
import type { UserAdmin } from '../types/user'

const createSidebarNavigationGroup = (
  admin: AdminConfig,
  user: UserAdmin,
): SidebarNavigationGroup[] => {
  const defaultGroupSlug = 'navigation'
  const defaultGroupLabel = 'Navigation'

  // Group menus by their group slug (or use default group for menus without a group)
  const groupMap = new Map<string, SidebarNavigationGroup>()

  admin.menus.forEach((menu) => {
    // Check if menu should be hidden for this user
    if (menu.hide && menu.hide(user)) {
      return
    }

    const groupSlug = menu.group?.slug ?? defaultGroupSlug
    const groupLabel = menu.group?.label ?? menu.group?.slug.toUpperCase() ?? defaultGroupLabel

    // Get or create the group
    if (!groupMap.has(groupSlug)) {
      groupMap.set(groupSlug, {
        slug: groupSlug,
        label: groupLabel,
        items: [],
      })
    }

    const group = groupMap.get(groupSlug)!

    // Create the navigation item from the menu
    const navigationItem: SidebarNavigationItem = {
      slug: menu.slug,
      label: menu.label ?? menu.slug.charAt(0).toUpperCase() + menu.slug.slice(1),
      url: menu.url ?? `/admin/${menu.slug}`,
      ...(menu.icon && { icon: menu.icon }),
    }

    group.items.push(navigationItem)
  })

  // Convert map to array and filter out empty groups
  return Array.from(groupMap.values()).filter((group) => group.items.length > 0)
}

export const createAdminMenu = (
  admin: AdminConfig,
  user: UserAdmin,
): {
  header: SidebarHeader
  sidebarGroup: SidebarNavigationGroup[]
} => {
  const sidebarHeader: SidebarHeader = {
    appName: admin.title,
    appInitial: admin.title
      .split(' ')
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join(''),
    subtitle: '',
  }

  const sidebarGroup = createSidebarNavigationGroup(admin, user)
  return {
    header: sidebarHeader,
    sidebarGroup: sidebarGroup,
  }
}
