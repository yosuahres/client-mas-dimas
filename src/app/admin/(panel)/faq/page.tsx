import type { Metadata } from "next";

import { FaqManager } from "@/app/admin/(panel)/faq/faq-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminFaqs } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Pertanyaan" };

export default async function FaqPage() {
  const faqs = await adminFaqs();
  return (
    <>
      <PageHeader title="Pertanyaan" />
      <PageBody>
        <FaqManager faqs={faqs} />
      </PageBody>
    </>
  );
}
