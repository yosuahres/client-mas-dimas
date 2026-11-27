"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { saveFaq } from "@/app/admin/(panel)/faq/actions";
import { autoTranslatedPlaceholder, LocaleTabs, SwitchField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { FaqRecord } from "@/lib/content/schema";
import { translate } from "@/lib/content/translate";

export function FaqManager({ faqs }: { faqs: FaqRecord[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const faq = faqs.find((candidate) => candidate.id === editing) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Tambah pertanyaan
        </Button>
      </div>
      <ItemList
        list="faqs"
        emptyText="Belum ada pertanyaan."
        onEdit={setEditing}
        items={faqs.map((candidate) => ({
          key: candidate.id,
          label: translate(candidate.question, "id"),
          published: candidate.published,
          content: (
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium sm:line-clamp-1">{translate(candidate.question, "id")}</p>
              <p className="truncate text-xs text-muted-foreground">{translate(candidate.answer, "id")}</p>
            </div>
          ),
        }))}
      />
      {editing !== null ? <FaqDialog key={editing} faq={faq} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function FaqDialog({ faq, onClose }: { faq: FaqRecord | null; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveFaq.bind(null, faq?.id ?? null), { onSuccess: onClose });

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={faq ? "Ubah pertanyaan" : "Tambah pertanyaan"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={faq ? "Simpan pertanyaan" : "Tambah pertanyaan"}
    >
      <LocaleTabs errors={errors} prefixes={["question", "answer"]}>
        {(locale) => (
          <div className="grid gap-4">
            <TextField
              name={`question.${locale}`}
              label="Pertanyaan"
              defaultValue={faq?.question[locale]}
              placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
              errors={errors}
            />
            <TextAreaField
              name={`answer.${locale}`}
              label="Jawaban"
              rows={5}
              defaultValue={faq?.answer[locale]}
              placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
              errors={errors}
            />
          </div>
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Tampilkan di website" defaultChecked={faq?.published ?? true} />
    </RecordDialog>
  );
}
