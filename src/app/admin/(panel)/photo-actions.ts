"use server";

import { requireAdmin } from "@/lib/admin/session";
import { PHOTO_BUCKET, photoUrl } from "@/lib/photos";

const folders = ["tours"] as const;

export type PhotoUpload = { ok: true; key: string; uploadUrl: string; previewUrl: string } | { ok: false; error: string };

/**
 * A fresh key and a signed URL the browser PUTs the compressed WebP to, so large files never pass through the
 * Node server on cPanel. Signed as the admin: the bucket's policies check the same admin role as the tables.
 */
export async function requestPhotoUpload(folder: (typeof folders)[number]): Promise<PhotoUpload> {
  const { supabase } = await requireAdmin();
  if (!folders.includes(folder)) return { ok: false, error: "Unknown photo folder." };
  const key = `${folder}/${crypto.randomUUID()}.webp`;
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUploadUrl(key);
  if (error) {
    console.error(`Couldn't sign an upload to the "${PHOTO_BUCKET}" bucket.`, error);
    return { ok: false, error: "Photo uploads aren't set up yet: run the photos bucket migration in Supabase." };
  }
  return { ok: true, key, uploadUrl: data.signedUrl, previewUrl: photoUrl(key)! };
}
