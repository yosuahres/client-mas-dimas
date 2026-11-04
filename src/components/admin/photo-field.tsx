"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { requestPhotoUpload } from "@/app/admin/(panel)/photo-actions";
import { Button } from "@/components/ui/button";

// Photos are shrunk in the browser before upload: at most 2000 px wide, WebP, aiming under ~400 KB,
// which keeps Supabase Storage well inside its free tier and pages fast for guests on mobile data.
const MAX_WIDTH = 2000;
const TARGET_BYTES = 400_000;

async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.65]) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= TARGET_BYTES) break;
  }
  if (!blob || blob.type !== "image/webp") throw new Error("This browser can't convert photos to WebP. Try Chrome or Firefox.");
  return blob;
}

type PhotoFieldProps = {
  name: string;
  /** The stored value: a storage key or a /public path. */
  defaultValue: string | null;
  /** The URL to preview the stored value. */
  defaultPreview: string | null;
  error?: string;
};

export function PhotoField({ name, defaultValue, defaultPreview, error }: PhotoFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState(defaultPreview);
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function upload(file: File) {
    startUpload(async () => {
      try {
        const webp = await compressToWebp(file);
        const target = await requestPhotoUpload("tours");
        if (!target.ok) throw new Error(target.error);
        // Each upload gets a new key, so the file never changes and browsers may cache it for a year.
        const response = await fetch(target.uploadUrl, {
          method: "PUT",
          body: webp,
          headers: { "content-type": "image/webp", "cache-control": "max-age=31536000" },
        });
        if (!response.ok) throw new Error(`The upload failed (${response.status}). Try again.`);
        setValue(target.key);
        setPreview(target.previewUrl);
        toast.success(`Photo uploaded (${Math.round(webp.size / 1000)} KB). Save to use it.`);
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : "The upload failed.");
      }
    });
  }

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={value} />
      <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-lg border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of a just-uploaded file
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <p className="grid size-full place-items-center text-xs text-muted-foreground">No photo yet</p>
        )}
        {uploading ? <div className="absolute inset-0 grid place-items-center bg-background/70 text-xs">Uploading…</div> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <ImageUp />
          {value ? "Replace photo" : "Upload photo"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => {
              setValue("");
              setPreview(null);
            }}
          >
            <Trash2 />
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Wide photos work best; it&apos;s resized automatically.</p>}
    </div>
  );
}
