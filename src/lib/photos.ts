// A stored photo is either a path under /public ("/photos/borobudur.jpg", the photos bundled with the site)
// or an R2 object key ("tours/9f2c….webp", uploaded from the admin panel).

export function isBundledPhoto(photo: string) {
  return photo.startsWith("/");
}

export function photoUrl(photo: string | null): string | null {
  if (!photo) return null;
  if (isBundledPhoto(photo)) return photo;
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error(`Photo "${photo}" is on R2, but R2_PUBLIC_URL isn't set`);
  return `${base.replace(/\/$/, "")}/${photo}`;
}
