"use client";

import { ChevronLeft, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

import { LAST_PANEL_PATH_KEY, settingsGroups, settingsPages } from "@/components/admin/settings-nav";
import { LogoMark } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const PANEL_HOME = "/admin";

const subscribeToNothing = () => () => {};

function lastPanelPath() {
  try {
    const last = sessionStorage.getItem(LAST_PANEL_PATH_KEY);
    return last?.startsWith(PANEL_HOME) ? last : PANEL_HOME;
  } catch {
    return PANEL_HOME;
  }
}

function SettingsSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  // The page the admin was on before opening settings; the dashboard until the browser has been asked.
  const backHref = useSyncExternalStore(subscribeToNothing, lastPanelPath, () => PANEL_HOME);

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="p-0">
        <Link
          href={PANEL_HOME}
          onClick={closeMobileSidebar}
          className="flex items-center gap-2 px-1 pt-2 pb-3 text-[15px] font-medium tracking-[-0.02em]"
        >
          <LogoMark className="size-5 text-brand" />
          jogja travel
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-1">
        {settingsGroups.map((group) => (
          <SidebarGroup key={group.title} className="px-0 py-0">
            <p className="px-1 py-1 text-[11px] font-normal text-muted-foreground">{group.title}</p>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.pages.map((page) => (
                  <SidebarMenuItem key={page.href}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={pathname === page.href}
                      tooltip={page.title}
                      className="pl-1 [&_svg]:text-muted-foreground/80"
                    >
                      <Link href={page.href} onClick={closeMobileSidebar}>
                        <page.icon />
                        <span className="text-[13px] font-medium">{page.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-0">
        <SidebarMenu>
          <SidebarSeparator className="mx-0" />
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" tooltip="Back to admin" className="pl-1">
              <Link href={backHref} onClick={closeMobileSidebar}>
                <ChevronLeft />
                <span className="text-[13px] font-medium">Back to admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/**
 * The settings area, on its own pages with its own sidebar as in the CRM in majorsales-binapatria:
 * a 48px bar naming the page, then a centred column with the page's heading and description.
 */
export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = settingsPages.find((candidate) => candidate.href === pathname);
  const Icon = page?.icon ?? Settings;
  const title = page?.title ?? "Settings";

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <SettingsSidebar />
      <SidebarInset className="flex flex-col overflow-hidden bg-background">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Icon className="size-4 text-muted-foreground" />
          <p className="text-sm">{title}</p>
        </header>
        {/* Bottom padding matches PageBody's, which the sticky SaveBar is measured against. */}
        <div className="flex-1 overflow-y-auto px-4 pt-8 pb-4 sm:px-6 sm:pt-16 sm:pb-6">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {page ? <p className="text-sm text-muted-foreground">{page.description}</p> : null}
            </div>
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
