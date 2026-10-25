import { SidebarHeader } from '~/components/ui/sidebar'
import type { SidebarHeader as SidebarHeaderType } from '../../types/sidebar-header'

interface DashboardSidebarHeaderProps {
  config: SidebarHeaderType
}

export function DashboardSidebarHeader({ config }: DashboardSidebarHeaderProps) {
  return (
    <SidebarHeader>
      <div className="flex min-w-0 items-center gap-2 overflow-hidden px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">{config.appInitial}</span>
        </div>
        <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-semibold">{config.appName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {config.subtitle || 'Dashboard'}
          </span>
        </div>
      </div>
    </SidebarHeader>
  )
}
