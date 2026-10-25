import type { ReactNode } from 'react'
import { LanguageSwitcher } from '~/components/language-switcher'
import { HeaderUserMenu } from '~/components/layouts/header-user-menu'
import { Separator } from '~/components/ui/separator'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { DashboardSidebarHeader } from '~/features/admin/components/sidebar/sidebar-header'
import { DashboardSidebarNavigation } from '~/features/admin/components/sidebar/sidebar-navigation'
import type { AdminConfig } from '~/features/admin/types/admin-config'
import type { UserAdmin } from '~/features/admin/types/user'
import { createAdminMenu } from '~/features/admin/utils/convert-config'
import * as m from '~/paraglide/messages.js'

interface TrackAppLayoutProps {
  children: ReactNode
  config: AdminConfig
  user: UserAdmin
}

export function TrackAppLayout({ children, config, user }: TrackAppLayoutProps) {
  const menuLabels: Record<string, () => string> = {
    dashboard: m.track_app_dashboard,
    learners: m.track_app_learners,
    schedule: m.track_app_schedule,
    'learning-templates': m.track_app_learning_templates,
    settings: m.track_app_settings,
  }
  const localizedConfig = {
    ...config,
    menus: config.menus.map((menu) => ({
      ...menu,
      label: menuLabels[menu.slug]?.() ?? menu.label,
      group: {
        ...menu.group,
        slug: menu.group?.slug ?? 'navigation',
        label: menu.group?.label ?? m.track_app_navigation(),
      },
    })),
  }
  const menu = createAdminMenu(localizedConfig, user)
  const header = { ...menu.header, subtitle: config.subTitle ?? m.track_app_dashboard() }
  const sidebarGroup = menu.sidebarGroup

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <DashboardSidebarHeader config={header} />
        <DashboardSidebarNavigation groups={sidebarGroup} />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator className="h-6" orientation="vertical" />
          <span className="text-sm font-medium">{header.appName}</span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <HeaderUserMenu
              dashboardPath={null}
              logoutRedirect="/login"
              settingsPath="/track-app/settings"
              showUserInfo
              user={user}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
