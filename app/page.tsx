import { supabase, CardSet, Article } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

async function getCardSets(): Promise<CardSet[]> {
  try {
    const { data } = await supabase.from("cardsets").select("*").order("date", { ascending: false });
    return (data as CardSet[]) ?? [];
  } catch { return []; }
}

async function getArticles(): Promise<Article[]> {
  try {
    const { data } = await supabase.from("articles").select("*").order("date", { ascending: false });
    return (data as Article[]) ?? [];
  } catch { return []; }
}

export default async function HomePage() {
  const [cardsets, articles] = await Promise.all([getCardSets(), getArticles()]);
  return <HomeClient cardsets={cardsets} articles={articles} />;
}
