import type { ReactNode } from 'react'
import { Separator } from '~/components/ui/separator'
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import type { AdminConfig } from '../types/admin-config'
import type { UserAdmin } from '../types/user'
import { createAdminMenu } from '../utils/convert-config'
import { DashboardSidebarFooter } from './sidebar/sidebar-footer'
import { DashboardSidebarHeader } from './sidebar/sidebar-header'
import { DashboardSidebarNavigation } from './sidebar/sidebar-navigation'

interface AdminLayoutProps {
  user: UserAdmin
  onSignOut: () => void
  config: AdminConfig
  children?: ReactNode
}

export function AdminLayout({ user, onSignOut, config, children }: AdminLayoutProps) {
  const { header, sidebarGroup } = createAdminMenu(config, user)

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar>
        <DashboardSidebarHeader config={header} />
        <DashboardSidebarNavigation groups={sidebarGroup} />
        <DashboardSidebarFooter user={user} onSignOut={onSignOut} />
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{header.appName}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
