import Link from "next/link";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  /** A parent page, shown as "Parent / Title". */
  parent?: { href: string; title: string };
  actions?: ReactNode;
};

// The 48px bar at the top of every admin page, as in the CRM: sidebar toggle, a divider, the title, actions on the right.
export function PageHeader({ title, parent, actions }: PageHeaderProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
        {parent ? (
          <>
            <Link href={parent.href} className="font-normal text-muted-foreground hover:text-foreground">
              {parent.title}
            </Link>
            <span className="mx-1.5 font-normal text-muted-foreground">/</span>
          </>
        ) : null}
        {title}
      </h1>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** The scrolling body under the header. */
export function PageBody({ children, width = "max-w-5xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className={width}>{children}</div>
    </div>
  );
}
