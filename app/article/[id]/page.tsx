import { supabase, CardSet } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

async function getCardSet(id: string): Promise<CardSet | null> {
  try {
    const { data } = await supabase
      .from("cardsets")
      .select("*")
      .eq("id", id)
      .single();
    return data as CardSet | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cs = await getCardSet(id);
  if (!cs) return { title: "나무카드" };

  return {
    title: cs.title,
    description: cs.summary?.slice(0, 120) ?? "",
    openGraph: {
      title: cs.title,
      description: cs.summary?.slice(0, 120) ?? "",
      images: cs.card_urls?.[0] ? [{ url: cs.card_urls[0] }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const cs = await getCardSet(id);

  if (!cs) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Suit", sans-serif', color: "#7A7A72" }}>
        말씀 카드를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh", padding: "80px 24px" }}>
      <article style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* 상단 메타 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#7A7A72", letterSpacing: "0.05em", marginBottom: 8 }}>
            나무십자가교회
            {cs.series ? ` · ${cs.series}` : ""}
            {cs.date ? ` · ${cs.date}` : ""}
          </div>
          {cs.scripture && (
            <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 13, color: "#3D6B4F", fontWeight: 500 }}>
              {cs.scripture}
            </div>
          )}
        </div>

        {/* 설교 제목 */}
        <h1 style={{
          fontFamily: '"GMarketSans", sans-serif',
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 700,
          color: "#1E1E1C",
          lineHeight: 1.25,
          marginBottom: 32,
          letterSpacing: "-0.02em",
        }}>
          {cs.title}
        </h1>

        {/* 구분선 */}
        <div style={{ width: 40, height: 2, background: "#3D6B4F", marginBottom: 32 }} />

        {/* 본문 */}
        {cs.summary && (
          <p style={{
            fontFamily: '"Suit", sans-serif',
            fontSize: 17,
            color: "#333",
            lineHeight: 1.9,
            marginBottom: 40,
            wordBreak: "keep-all",
          }}>
            {cs.summary}
          </p>
        )}

        {/* 영상 버튼 */}
        {cs.youtube_url && (
          <a
            href={cs.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#1E1E1C",
              color: "#fff",
              borderRadius: 8,
              padding: "14px 24px",
              fontFamily: '"Suit", sans-serif',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: 48,
            }}
          >
            <span style={{ fontSize: 18 }}>▶</span>
            설교 영상 보기
          </a>
        )}

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 14, fontWeight: 700, color: "#3D6B4F" }}>
            나무카드.
          </div>
          <Link href="/" style={{ fontFamily: '"Suit", sans-serif', fontSize: 13, color: "#7A7A72" }}>
            나무십자가교회
          </Link>
        </div>
      </article>
    </div>
  );
}
