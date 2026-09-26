import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { Separator } from '~/components/ui/separator'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import type { SidebarNavigationGroup } from '../../types/sidebar-navigation'

interface DashboardSidebarNavigationProps {
  groups: SidebarNavigationGroup[]
}

export function DashboardSidebarNavigation({ groups }: DashboardSidebarNavigationProps) {
  const location = useLocation()

  return (
    <SidebarContent>
      {groups.map((group, index) => (
        <div key={group.label}>
          {index > 0 && <Separator className="my-2" />}
          <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.label}
                    >
                      <Link to={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      ))}
    </SidebarContent>
  )
}
