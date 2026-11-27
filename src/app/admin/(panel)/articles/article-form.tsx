"use client";

import { ExternalLink } from "lucide-react";

import { saveArticle } from "@/app/admin/(panel)/articles/actions";
import { autoTranslatedPlaceholder, FormSection, LocaleTabs, SaveBar, SwitchField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { PhotosField } from "@/components/admin/photos-field";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { ArticleRecord } from "@/lib/content/schema";

type ArticleFormProps = {
  article: ArticleRecord | null;
  coverPreview: string | null;
  photos: { key: string; preview: string }[];
};

/** Today in Jogja, "2026-11-27", for a new article's date. */
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export function ArticleForm({ article, coverPreview, photos }: ArticleFormProps) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveArticle.bind(null, article?.slug ?? null));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Artikel">
        <TextField
          name="publishedOn"
          label="Tanggal"
          type="date"
          defaultValue={article?.publishedOn ?? today()}
          errors={errors}
          className="max-w-xs"
        />
        <SwitchField
          name="published"
          label="Tampilkan di website"
          defaultChecked={article?.published ?? true}
        />
      </FormSection>

      <FormSection title="Teks">
        <LocaleTabs errors={errors} prefixes={["text"]}>
          {(locale) => {
            const text = article?.text[locale];
            const prefix = `text.${locale}`;
            const placeholder = locale === "id" ? "" : autoTranslatedPlaceholder;
            return (
              <div className="grid gap-4">
                <TextField name={`${prefix}.title`} label="Judul" defaultValue={text?.title} errors={errors} placeholder={placeholder} />
                <TextAreaField
                  name={`${prefix}.excerpt`}
                  label="Ringkasan"
                  rows={2}
                  defaultValue={text?.excerpt}
                  errors={errors}
                  placeholder={placeholder}
                />
                <TextAreaField
                  name={`${prefix}.body`}
                  label="Isi artikel"
                  rows={16}
                  defaultValue={text?.body}
                  errors={errors}
                  placeholder={placeholder}
                />
              </div>
            );
          }}
        </LocaleTabs>
      </FormSection>

      <FormSection title="Foto">
        <PhotoField name="cover" folder="articles" defaultValue={article?.cover ?? null} defaultPreview={coverPreview} error={errors.cover} />
        <PhotosField name="photos" folder="articles" defaultPhotos={photos} error={errors.photos} />
      </FormSection>

      <SaveBar pending={pending} label={article ? "Simpan perubahan" : "Buat artikel"}>
        {article ? (
          <Button asChild variant="ghost">
            <a href={`/id/articles/${article.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink />
              Lihat di website
            </a>
          </Button>
        ) : null}
      </SaveBar>
    </form>
  );
}
