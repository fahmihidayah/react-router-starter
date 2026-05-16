import type { ReactNode } from 'react'
import { Separator } from '~/components/ui/separator'
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { defaultHeaderConfig, defaultNavigationGroups } from './config'
import { DashboardSidebarFooter, type UserSession } from './sidebar-footer'
import { DashboardSidebarHeader, type SidebarHeaderConfig } from './sidebar-header'
import { DashboardSidebarNavigation, type NavigationGroup } from './sidebar-navigation'

export interface DashboardLayoutConfig {
  header?: SidebarHeaderConfig
  navigationGroups?: NavigationGroup[]
  headerTitle?: string
}

interface DashboardLayoutProps {
  user: UserSession
  onSignOut: () => void
  config?: DashboardLayoutConfig
  children?: ReactNode
}

export function DashboardLayout({ user, onSignOut, config = {}, children }: DashboardLayoutProps) {
  const headerConfig = config.header || defaultHeaderConfig
  const navigationGroups = config.navigationGroups || defaultNavigationGroups
  const headerTitle = config.headerTitle || 'Dashboard'

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar>
        <DashboardSidebarHeader config={headerConfig} />
        <DashboardSidebarNavigation groups={navigationGroups} />
        <DashboardSidebarFooter user={user} onSignOut={onSignOut} />
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{headerTitle}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
