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
        <p className="max-w-xl text-sm text-muted-foreground">The questions on the Questions page, in this order.</p>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Add question
        </Button>
      </div>
      <ItemList
        list="faqs"
        emptyText="No questions yet."
        onEdit={setEditing}
        items={faqs.map((candidate) => ({
          key: candidate.id,
          label: translate(candidate.question, "id"),
          published: candidate.published,
          content: (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{translate(candidate.question, "id")}</p>
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
      title={faq ? "Edit question" : "Add a question"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={faq ? "Save question" : "Add question"}
    >
      <LocaleTabs errors={errors} prefixes={["question", "answer"]}>
        {(locale) => (
          <div className="grid gap-4">
            <TextField
              name={`question.${locale}`}
              label="Question"
              defaultValue={faq?.question[locale]}
              placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
              errors={errors}
            />
            <TextAreaField
              name={`answer.${locale}`}
              label="Answer"
              rows={5}
              defaultValue={faq?.answer[locale]}
              placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
              errors={errors}
            />
          </div>
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Show on the website" defaultChecked={faq?.published ?? true} />
    </RecordDialog>
  );
}
