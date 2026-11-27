"use client";

import { ExternalLink, ImageUp } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { addGalleryPhotos, saveGalleryPhoto } from "@/app/admin/(panel)/gallery/actions";
import { autoTranslatedPlaceholder, LocaleTabs, SwitchField, TextField } from "@/components/admin/form-fields";
import { ItemList } from "@/components/admin/item-list";
import { PhotoField, uploadPhoto } from "@/components/admin/photo-field";
import { RecordDialog } from "@/components/admin/record-dialog";
import { runAction, useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { GalleryPhotoRecord } from "@/lib/content/schema";

type GalleryItem = GalleryPhotoRecord & { preview: string };

export function GalleryManager({ photos }: { photos: GalleryItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [progress, setProgress] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const photo = photos.find((candidate) => candidate.id === editing) ?? null;

  function upload(files: File[]) {
    startUpload(async () => {
      const keys: string[] = [];
      for (const [index, file] of files.entries()) {
        setProgress(`${index + 1} dari ${files.length}`);
        try {
          keys.push((await uploadPhoto(file, "gallery")).key);
        } catch (cause) {
          toast.error(`${file.name}: ${cause instanceof Error ? cause.message : "gagal mengunggah."}`);
        }
      }
      setProgress("");
      if (keys.length === 0) return;
      await runAction(() => addGalleryPhotos(keys));
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-2">
          <Button asChild size="sm" variant="ghost">
            <a href="/id/gallery" target="_blank" rel="noreferrer">
              <ExternalLink />
              Lihat
            </a>
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) upload(files);
              event.target.value = "";
            }}
          />
          <Button size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
            <ImageUp />
            {uploading ? `Mengunggah ${progress}…` : "Unggah foto"}
          </Button>
        </div>
      </div>
      <ItemList
        list="gallery"
        emptyText="Belum ada foto. Unggah foto pertama."
        onEdit={setEditing}
        items={photos.map((candidate, index) => ({
          key: candidate.id,
          label: `foto ${index + 1}`,
          published: candidate.published,
          content: (
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                <img src={candidate.preview} alt="" className="size-full object-cover" />
              </div>
              <p className={`line-clamp-2 text-sm ${candidate.caption.id || candidate.caption.en ? "" : "text-muted-foreground"}`}>
                {candidate.caption.id || candidate.caption.en || "Tanpa keterangan"}
              </p>
            </div>
          ),
        }))}
      />
      {photo ? <GalleryPhotoDialog key={photo.id} photo={photo} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function GalleryPhotoDialog({ photo, onClose }: { photo: GalleryItem; onClose: () => void }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveGalleryPhoto.bind(null, photo.id), { onSuccess: onClose });

  return (
    <RecordDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Ubah foto"
      onSubmit={onSubmit}
      pending={pending}
      submitLabel="Simpan foto"
    >
      <PhotoField name="photo" folder="gallery" defaultValue={photo.photo} defaultPreview={photo.preview} error={errors.photo} />
      <LocaleTabs errors={errors} prefixes={["caption"]}>
        {(locale) => (
          <TextField
            name={`caption.${locale}`}
            label="Keterangan"
            defaultValue={photo.caption[locale]}
            placeholder={locale === "id" ? "Jemput di Bandara YIA" : autoTranslatedPlaceholder}
            errors={errors}
          />
        )}
      </LocaleTabs>
      <SwitchField name="published" label="Tampilkan di website" defaultChecked={photo.published} />
    </RecordDialog>
  );
}
