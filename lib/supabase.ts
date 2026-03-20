import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    _supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder");
  }
  return _supabase;
}

// 편의상 named export (클라이언트에서 사용)
export const supabase = {
  from: (...args: Parameters<SupabaseClient["from"]>) => getSupabase().from(...args),
  storage: { from: (bucket: string) => getSupabase().storage.from(bucket) },
};

// Server-side (service role)
export function createServiceClient() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()
  );
}

// 타입
export type CardTextData = {
  subtitle?: string;
  content: string;
};

export type CardSet = {
  id: string;
  slug?: string;
  date: string;
  title: string;
  series?: string;
  scripture?: string;
  summary?: string;
  cards_data?: CardTextData[];
  youtube_url?: string;
  template_id: string;
  format: "feed" | "story";
  card_urls: string[];
  created_at: string;
};

export type Article = {
  id: string;
  slug?: string;
  title: string;
  date: string;
  series?: string;
  scripture: string;
  body?: string;
  god_father?: string;
  god_son?: string;
  god_spirit?: string;
  youtube_url?: string;
  created_at: string;
};

/** 6자리 짧은 슬러그 생성 */
export function generateSlug(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "";
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export type Template = {
  id: string;
  name: string;
  thumbnail_url?: string;
  bg_image_url?: string;
  format: "feed" | "story";
  text_areas?: Record<string, unknown>;
  active: boolean;
  bg_color: string;
  text_color: string;
  created_at: string;
};
