"use server";

import { requireAdmin } from "@/lib/admin/session";
import { photoUrl } from "@/lib/photos";
import { isR2Configured, presignUpload } from "@/lib/r2";

const folders = ["tours"] as const;

export type PhotoUpload = { ok: true; key: string; uploadUrl: string; previewUrl: string } | { ok: false; error: string };

/** A fresh R2 key and a ten-minute URL the browser PUTs the compressed WebP to. */
export async function requestPhotoUpload(folder: (typeof folders)[number]): Promise<PhotoUpload> {
  await requireAdmin();
  if (!folders.includes(folder)) return { ok: false, error: "Unknown photo folder." };
  if (!isR2Configured()) {
    return { ok: false, error: "Photo uploads aren't set up yet: the R2 settings are missing from the server." };
  }
  const key = `${folder}/${crypto.randomUUID()}.webp`;
  const uploadUrl = await presignUpload(key, "image/webp");
  return { ok: true, key, uploadUrl, previewUrl: photoUrl(key)! };
}
