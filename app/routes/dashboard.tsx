import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Home, LayoutDashboard, Users, Settings, LogOut, Package, CheckSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useSession } from "~/lib/auth-client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";

// Sidebar navigation items - easy to modify
const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending, error } = useSession();

  // Authentication check
  useEffect(() => {
    if (!isPending && !session) {
      toast.error("Authentication Required", {
        description: "Please sign in to access the dashboard",
      });
      navigate("/login");
    }
  }, [session, isPending, navigate]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const authClient = (await import("~/lib/auth-client")).authClient;
      await authClient.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (err) {
      console.error("Sign out failed:", err);
      toast.error("Failed to sign out");
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  // No session state
  if (error || !session) {
    return null;
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar>
        {/* Sidebar Header */}
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Starter App</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent>
          {/* Navigation Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-2" />

          {/* Quick Links Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Back to Home">
                    <Link to="/">
                      <Home />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
