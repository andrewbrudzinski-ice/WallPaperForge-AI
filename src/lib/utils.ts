import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Trigger a browser download for an image URL (https or data URL). */
/** Infer the correct file extension from a data URL's mime type or a path. */
export function imageExtension(url: string): string {
  if (url.startsWith("data:")) {
    const mime = /^data:([^;,]+)/.exec(url)?.[1] ?? "image/png";
    if (mime.includes("svg")) return "svg";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("webp")) return "webp";
    if (mime.includes("gif")) return "gif";
    return "png";
  }
  const ext = /\.(png|jpe?g|webp|svg|gif)(?:\?|#|$)/i.exec(url)?.[1];
  return ext ? ext.toLowerCase().replace("jpeg", "jpg") : "png";
}

/**
 * Download an image. `baseName` should NOT include an extension — the correct
 * one is derived from the actual content type so files always open correctly
 * (e.g. the mock provider's SVGs save as `.svg`, real PNGs as `.png`).
 */
export async function downloadImage(url: string, baseName: string): Promise<void> {
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
  a.download = `${baseName}.${imageExtension(url)}`;
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
