"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { saveReview } from "@/app/admin/(panel)/reviews/actions";
import { autoTranslatedPlaceholder, LocaleTabs, SelectField, SwitchField, TextAreaField, TextField, type SelectOption } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { RecordDialog } from "@/components/admin/record-dialog";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { ReviewRecord } from "@/lib/content/schema";
import { translate } from "@/lib/content/translate";

type ReviewsManagerProps = {
  reviews: ReviewRecord[];
  tours: SelectOption[];
};

export function ReviewsManager({ reviews, tours }: ReviewsManagerProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const review = reviews.find((candidate) => candidate.id === editing) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Tambah ulasan
        </Button>
      </div>
      <ItemList
        list="reviews"
        emptyText="Belum ada ulasan."
        onEdit={setEditing}
        items={reviews.map((candidate) => ({
          key: candidate.id,
          label: `ulasan dari ${candidate.guestName}`,
          published: candidate.published,
          content: (
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm">&ldquo;{translate(candidate.quote, "id")}&rdquo;</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {candidate.guestName}, {translate(candidate.origin, "id")}
                {candidate.tourSlug ? ` · ${tours.find((tour) => tour.value === candidate.tourSlug)?.label ?? candidate.tourSlug}` : ""}
              </p>
            </div>
          ),
        }))}
      />
      {editing !== null ? <ReviewDialog key={editing} review={review} tours={tours} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function ReviewDialog({ review, tours, onClose }: { review: ReviewRecord | null; tours: SelectOption[]; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveReview.bind(null, review?.id ?? null), { onSuccess: onClose });

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={review ? "Ubah ulasan" : "Tambah ulasan"}
      onSubmit={onSubmit}
      pending={pending}
      submitLabel={review ? "Simpan ulasan" : "Tambah ulasan"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="guestName" label="Nama tamu" placeholder="Emma" defaultValue={review?.guestName} errors={errors} />
        <SelectField
          name="tourSlug"
          label="Paket yang diambil"
          options={[{ value: "none", label: "Tanpa paket" }, ...tours]}
          defaultValue={review?.tourSlug ?? "none"}
          errors={errors}
        />
      </div>
      <LocaleTabs errors={errors} prefixes={["quote", "origin"]}>
        {(locale) => (
          <div className="grid gap-4">
            <TextAreaField
              name={`quote.${locale}`}
              label="Isi ulasan"
              rows={4}
              defaultValue={review?.quote[locale]}
              placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
              errors={errors}
            />
            <TextField
              name={`origin.${locale}`}
              label="Asal tamu"
              defaultValue={review?.origin[locale]}
              placeholder={locale === "id" ? "Melbourne, Australia" : autoTranslatedPlaceholder}
              errors={errors}
            />
          </div>
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Tampilkan di website" defaultChecked={review?.published ?? true} />
    </RecordDialog>
  );
}
