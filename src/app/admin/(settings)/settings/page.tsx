import { redirect } from "next/navigation";

import { SETTINGS_HOME } from "@/components/admin/settings-nav";

export default function SettingsIndexPage() {
  redirect(SETTINGS_HOME);
}
