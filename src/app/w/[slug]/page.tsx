import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ArrowRight, Download } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { getPublicWallpaper } from "@/lib/gallery/gallery-service";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ShareActions } from "@/components/gallery/ShareActions";
import { LikeButton } from "@/components/gallery/LikeButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: { slug: string };
}

async function load(slug: string) {
  const sb = getServerSupabase();
  if (!sb) return null;
  const { data: auth } = await sb.auth.getUser();
  return getPublicWallpaper(sb, slug, auth?.user?.id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const w = await load(params.slug);
  if (!w) return { title: "Wallpaper not found — WallpaperForge AI" };

  const title = `${w.description} — WallpaperForge AI`;
  const isHttp = w.imageUrl.startsWith("http");
  const images = [{ url: isHttp ? w.imageUrl : "/icon-512.png" }];
  return {
    title,
    description: "A device-perfect AI wallpaper made with WallpaperForge AI.",
    openGraph: { title, images, type: "website" },
    twitter: { card: "summary_large_image", title, images },
  };
}

export default async function PublicWallpaperPage({ params }: Params) {
  const w = await load(params.slug);
  if (!w) notFound();

  return (
    <>
      <AmbientBackground />
      <main className="flex flex-1 flex-col items-center px-5 py-8">
        <Link href="/home" className="mb-6 flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-accent" /> WallpaperForge AI
        </Link>

        <div
          className="relative w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl"
          style={{ aspectRatio: `${w.width} / ${w.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={w.imageUrl}
            alt={w.description}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-5 w-full max-w-[360px] text-center">
          {w.category && (
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              {w.category}
            </span>
          )}
          <h1 className="mt-3 text-lg font-semibold">{w.description}</h1>
          <p className="mt-1 text-sm text-white/50">
            Made with WallpaperForge AI — wallpapers composed for your exact phone.
          </p>

          <div className="mt-3 flex justify-center">
            <LikeButton
              wallpaperId={w.id}
              initialCount={w.likeCount}
              initialLiked={w.likedByMe}
            />
          </div>

          <ShareActions imageUrl={w.imageUrl} description={w.description} />

          <Link
            href="/home"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-accent to-accent-soft px-5 py-3.5 font-semibold text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
          >
            Create your own <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/35">
            <Download className="h-3.5 w-3.5" /> Free · works on any phone
          </p>
        </div>
      </main>
    </>
  );
}
