import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Trigger a browser download for an image URL (https or data URL). */
export async function downloadImage(url: string, filename: string): Promise<void> {
  // data: URLs can be downloaded directly; remote URLs are fetched into a blob
  // to bypass cross-origin download restrictions.
  let href = url;
  let revoke = false;
  if (!url.startsWith("data:")) {
    const res = await fetch(url);
    const blob = await res.blob();
    href = URL.createObjectURL(blob);
    revoke = true;
  }
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) URL.revokeObjectURL(href);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
