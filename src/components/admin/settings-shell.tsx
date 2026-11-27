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
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
          className="flex items-center gap-2 px-1 pt-2 pb-1 text-[15px] font-medium tracking-[-0.02em]"
        >
          <LogoMark className="size-5 text-brand" />
          jogja travel
        </Link>
        {/* At the top, styled like "Lihat website" in the main menu, so the way back to editing the website is the
            first thing seen rather than a footer link a phone's bottom edge can hide. */}
        <Link
          href={backHref}
          onClick={closeMobileSidebar}
          className="mb-2 flex w-full items-center gap-2 rounded-md border border-foreground/15 bg-white px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-white/90 max-md:py-2.5 max-md:text-[13px]"
        >
          <ChevronLeft className="size-3.5 shrink-0" />
          Kembali ke admin
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
                      className="pl-1 max-md:h-10 [&_svg]:text-muted-foreground/80"
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

    </Sidebar>
  );
}

/**
 * The settings area, on its own pages with its own sidebar as in the CRM in majorsales-binapatria:
 * a 48px bar naming the page, then a centred column with the page heading.
 */
export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = settingsPages.find((candidate) => candidate.href === pathname);
  const Icon = page?.icon ?? Settings;
  const title = page?.title ?? "Pengaturan";

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
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
