"use client";

import {
  Bus,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  House,
  KeyRound,
  LogOut,
  Map as MapIcon,
  MapPinned,
  MessageSquareQuote,
  SlidersHorizontal,
  Type,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ElementType } from "react";

import { signOut } from "@/app/admin/login/actions";
import { LogoMark } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  title: string;
  icon: ElementType;
};

type NavGroup = {
  key: string;
  title: string;
  items: NavItem[];
};

const modules: NavItem[] = [{ href: "/admin", title: "Dashboard", icon: House }];

// Laid out like the CRM sidebar in majorsales-binapatria: plain modules first, then collapsible groups.
const groups: NavGroup[] = [
  {
    key: "content",
    title: "Content",
    items: [
      { href: "/admin/tours", title: "Tour packages", icon: MapIcon },
      { href: "/admin/reviews", title: "Reviews", icon: MessageSquareQuote },
      { href: "/admin/faq", title: "Questions", icon: CircleHelp },
      { href: "/admin/text", title: "Website text", icon: Type },
    ],
  },
  {
    key: "transport",
    title: "Transport",
    items: [
      { href: "/admin/fleet", title: "Cars & prices", icon: Bus },
      { href: "/admin/transfers", title: "Places & routes", icon: MapPinned },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    items: [
      { href: "/admin/settings", title: "Business details", icon: SlidersHorizontal },
      { href: "/admin/users", title: "Admin users", icon: Users },
      { href: "/admin/account", title: "My account", icon: KeyRound },
    ],
  },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ content: true, transport: true, settings: true });

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="p-0">
        <Link
          href="/admin"
          onClick={closeMobileSidebar}
          className="flex items-center gap-2 px-1 pt-2 pb-1 text-[15px] font-medium tracking-[-0.02em]"
        >
          <LogoMark className="size-5 text-brand" />
          jogja transport
        </Link>
        <a
          href="/en"
          target="_blank"
          rel="noreferrer"
          className="mb-2 flex w-full items-center gap-2 rounded-md border border-foreground/15 bg-white px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-white/90"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="flex-1">View website</span>
        </a>
      </SidebarHeader>

      <SidebarContent className="pt-1">
        <SidebarGroup className="px-0 py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild size="sm" isActive={isActive(item.href)} tooltip={item.title} className="pl-1 [&_svg]:text-muted-foreground/80">
                    <Link href={item.href} onClick={closeMobileSidebar}>
                      <item.icon />
                      <span className="text-[13px] font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {groups.map((group) => (
          <SidebarGroup key={group.key} className="px-0 py-0">
            <button
              type="button"
              onClick={() => setOpenGroups((open) => ({ ...open, [group.key]: !open[group.key] }))}
              aria-expanded={openGroups[group.key]}
              className="flex w-full items-center gap-1 rounded-md px-1 py-1 transition-colors hover:bg-accent"
            >
              <ChevronDown className={`size-3 text-muted-foreground transition-transform ${openGroups[group.key] ? "" : "-rotate-90"}`} />
              <span className="text-[11px] font-normal text-muted-foreground">{group.title}</span>
            </button>
            {openGroups[group.key] ? (
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild size="sm" isActive={isActive(item.href)} tooltip={item.title} className="pl-1">
                        <Link href={item.href} onClick={closeMobileSidebar}>
                          <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-500 text-white [&_svg]:size-3">
                            <item.icon />
                          </span>
                          <span className="text-[13px] font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            ) : null}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-0">
        <p className="truncate px-1 text-[11px] text-muted-foreground" title={email}>
          {email}
        </p>
        <form action={signOut}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit" size="sm" className="pl-1 [&_svg]:text-muted-foreground/80">
                <LogOut />
                <span className="text-[13px] font-medium">Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
