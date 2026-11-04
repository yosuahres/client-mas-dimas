// A stored photo is either a path under /public ("/photos/borobudur.jpg", the photos bundled with the site)
// or a key in the Supabase Storage bucket ("tours/9f2c….webp", uploaded from the admin panel).

export const PHOTO_BUCKET = "photos";

export function isBundledPhoto(photo: string) {
  return photo.startsWith("/");
}

export function photoUrl(photo: string | null): string | null {
  if (!photo) return null;
  if (isBundledPhoto(photo)) return photo;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error(`Photo "${photo}" is in Supabase Storage, but NEXT_PUBLIC_SUPABASE_URL isn't set`);
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${PHOTO_BUCKET}/${photo}`;
}
