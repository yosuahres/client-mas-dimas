"use client";

import { ArrowLeft, ArrowRight, ImageUp, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import type { PhotoFolder } from "@/app/admin/(panel)/photo-actions";
import { uploadPhoto } from "@/components/admin/photo-field";
import { Button } from "@/components/ui/button";

type Photo = { key: string; preview: string };

type PhotosFieldProps = {
  /** Sent as "<name>[]", one per photo, in order. */
  name: string;
  defaultPhotos: Photo[];
  folder: PhotoFolder;
  error?: string;
};

// Several photos in order, such as an article's: pick many at once, move them left or right, remove one.
export function PhotosField({ name, defaultPhotos, folder, error }: PhotosFieldProps) {
  const [photos, setPhotos] = useState(defaultPhotos);
  const [uploading, startUpload] = useTransition();
  const [progress, setProgress] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function upload(files: File[]) {
    startUpload(async () => {
      let failed = 0;
      for (const [index, file] of files.entries()) {
        setProgress(`${index + 1} dari ${files.length}`);
        try {
          const uploaded = await uploadPhoto(file, folder);
          setPhotos((current) => [...current, { key: uploaded.key, preview: uploaded.previewUrl }]);
        } catch (cause) {
          failed += 1;
          toast.error(cause instanceof Error ? cause.message : "Gagal mengunggah.");
        }
      }
      setProgress("");
      if (failed < files.length) toast.success("Foto terunggah. Simpan untuk memakainya.");
    });
  }

  function move(index: number, by: number) {
    setPhotos((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(index + by, 0, moved);
      return next;
    });
  }

  return (
    <div className="grid gap-2">
      {photos.map((photo) => (
        <input key={photo.key} type="hidden" name={`${name}[]`} value={photo.key} />
      ))}
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <li key={photo.key} className="group relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img src={photo.preview} alt="" className="size-full object-cover" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                <span className="flex gap-1">
                  <Button type="button" size="icon" variant="secondary" className="size-7" aria-label="Geser ke kiri" disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-7"
                    aria-label="Geser ke kanan"
                    disabled={index === photos.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRight />
                  </Button>
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-7"
                  aria-label="Hapus foto"
                  onClick={() => setPhotos((current) => current.filter((candidate) => candidate.key !== photo.key))}
                >
                  <X />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div>
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
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <ImageUp />
          {uploading ? `Mengunggah ${progress}…` : "Tambah foto"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
