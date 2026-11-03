import { connection } from "next/server";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SetupNotice } from "@/components/admin/setup-notice";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseConfig } from "@/lib/supabase/config";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  // Per request, never prerendered: the environment may get its Supabase settings after the build.
  await connection();
  if (!supabaseConfig()) return <SetupNotice />;
  const { user } = await requireAdmin();

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AdminSidebar email={user.email ?? ""} />
      <SidebarInset className="flex flex-col overflow-hidden bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
