import type {
  Collection,
  GeneratedWallpaper,
  GenerationMode,
  WallpaperCategory,
} from "@/types";

/**
 * Row shapes for the Supabase tables and pure mappers to/from the client store
 * types. Keeping these in one place means the DB schema and the in-app shapes
 * stay aligned, and the sync service has no inline SQL field juggling.
 */

export interface WallpaperRow {
  id: string;
  user_id: string;
  device_key: string;
  image_url: string;
  description: string;
  enhanced_prompt: string;
  category: string | null;
  mode: GenerationMode;
  provider: string;
  width: number;
  height: number;
  is_high_res: boolean;
  created_at: string;
}

export interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
}

export interface CollectionItemRow {
  collection_id: string;
  wallpaper_id: string;
}

export function rowToWallpaper(r: WallpaperRow, isFavorite: boolean): GeneratedWallpaper {
  return {
    id: r.id,
    imageUrl: r.image_url,
    description: r.description,
    enhancedPrompt: r.enhanced_prompt,
    category: (r.category as WallpaperCategory | null) ?? null,
    mode: r.mode,
    deviceId: r.device_key,
    width: r.width,
    height: r.height,
    provider: r.provider,
    createdAt: r.created_at,
    isFavorite,
  };
}

export function wallpaperToRow(
  w: GeneratedWallpaper,
  userId: string,
): WallpaperRow {
  return {
    id: w.id,
    user_id: userId,
    device_key: w.deviceId,
    image_url: w.imageUrl,
    description: w.description,
    enhanced_prompt: w.enhancedPrompt,
    category: w.category,
    mode: w.mode,
    provider: w.provider,
    width: w.width,
    height: w.height,
    is_high_res: false,
    created_at: w.createdAt,
  };
}

export function rowToCollection(
  r: CollectionRow,
  wallpaperIds: string[],
): Collection {
  return {
    id: r.id,
    name: r.name,
    coverUrl: r.cover_url,
    wallpaperIds,
    createdAt: r.created_at,
  };
}

export function collectionToRow(c: Collection, userId: string): CollectionRow {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    cover_url: c.coverUrl,
    created_at: c.createdAt,
  };
}
