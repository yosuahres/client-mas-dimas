import type { Metadata } from "next";

import { FaqManager } from "@/app/admin/(panel)/faq/faq-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminFaqs } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Questions" };

export default async function FaqPage() {
  const faqs = await adminFaqs();
  return (
    <>
      <PageHeader title="Questions" />
      <PageBody>
        <FaqManager faqs={faqs} />
      </PageBody>
    </>
  );
}
