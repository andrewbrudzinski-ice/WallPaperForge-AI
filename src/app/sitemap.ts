import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Static, public-facing routes. User libraries and share pages are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/home`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/generate`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/gallery`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
}
