import type { Metadata } from "next";

import { SettingsForm } from "@/app/admin/(settings)/settings/business/settings-form";
import { adminSettings } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Data usaha" };

export default async function BusinessSettingsPage() {
  const settings = await adminSettings();
  return <SettingsForm settings={settings} />;
}
