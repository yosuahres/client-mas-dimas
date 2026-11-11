import { connection } from "next/server";

import { SettingsShell } from "@/components/admin/settings-shell";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseConfig } from "@/lib/supabase/config";

// Settings live outside the (panel) layout so they get their own sidebar instead of the content one.
export default async function SettingsLayout({ children }: LayoutProps<"/admin/settings">) {
  // Per request, never prerendered: the environment may get its Supabase settings after the build.
  await connection();
  if (!supabaseConfig()) return <SetupNotice />;
  await requireAdmin();

  return <SettingsShell>{children}</SettingsShell>;
}
