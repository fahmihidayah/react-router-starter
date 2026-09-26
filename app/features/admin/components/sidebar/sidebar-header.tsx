import { SidebarHeader } from '~/components/ui/sidebar'
import type { SidebarHeader as SidebarHeaderType } from '../../types/sidebar-header'

interface DashboardSidebarHeaderProps {
  config: SidebarHeaderType
}

export function DashboardSidebarHeader({ config }: DashboardSidebarHeaderProps) {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">{config.appInitial}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{config.appName}</span>
          <span className="text-xs text-muted-foreground">{config.subtitle || 'Dashboard'}</span>
        </div>
      </div>
    </SidebarHeader>
  )
}
