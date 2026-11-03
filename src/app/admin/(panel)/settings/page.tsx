import type { Metadata } from "next";

import { SettingsForm } from "@/app/admin/(panel)/settings/settings-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminSettings } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Business details" };

export default async function SettingsPage() {
  const settings = await adminSettings();
  return (
    <>
      <PageHeader title="Business details" />
      <PageBody width="max-w-3xl">
        <SettingsForm settings={settings} />
      </PageBody>
    </>
  );
}
