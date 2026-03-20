import { supabase, CardSet, CardTextData } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import ScrollProgress from "./ScrollProgress";
import PageHeader from "@/components/PageHeader";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

async function getCardSet(idOrSlug: string): Promise<CardSet | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(idOrSlug);
    const column = isUuid ? "id" : "slug";
    const { data } = await supabase
      .from("cardsets")
      .select("*")
      .eq(column, idOrSlug)
      .single();
    return data as CardSet | null;
  } catch {
    return null;
  }
}

async function getAdjacentArticles(currentDate: string) {
  const prev = await supabase
    .from("cardsets")
    .select("id, slug, title, date")
    .lt("date", currentDate)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const next = await supabase
    .from("cardsets")
    .select("id, slug, title, date")
    .gt("date", currentDate)
    .order("date", { ascending: true })
    .limit(1)
    .single();

  return {
    prev: prev.data as Pick<CardSet, "id" | "slug" | "title" | "date"> | null,
    next: next.data as Pick<CardSet, "id" | "slug" | "title" | "date"> | null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cs = await getCardSet(id);
  if (!cs) return { title: "나무카드" };

  const desc = cs.cards_data?.length
    ? cs.cards_data.map((c) => c.content).join(" ").slice(0, 120)
    : cs.summary?.slice(0, 120) ?? "";

  return {
    title: cs.title,
    description: desc,
    openGraph: {
      title: cs.title,
      description: desc,
      images: cs.card_urls?.[0] ? [{ url: cs.card_urls[0] }] : [],
    },
  };
}

type Section = { subtitle?: string; paragraphs: string[] };

function sectionsFromCardsData(data: CardTextData[]): Section[] {
  return data.map((card) => ({
    subtitle: card.subtitle || undefined,
    paragraphs: card.content.split("\n").filter(Boolean),
  }));
}

function sectionsFromSummary(summary: string): Section[] {
  const blocks = summary.split("\n\n").filter(Boolean);
  const sections: Section[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length >= 2 && lines[0].length <= 30) {
      sections.push({ subtitle: lines[0], paragraphs: lines.slice(1) });
    } else {
      sections.push({ paragraphs: lines });
    }
  }
  return sections;
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const cs = await getCardSet(id);

  if (!cs) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Pretendard", -apple-system, sans-serif',
        color: "#999",
      }}>
        말씀 카드를 찾을 수 없습니다
      </div>
    );
  }

  const sections = cs.cards_data?.length
    ? sectionsFromCardsData(cs.cards_data)
    : cs.summary
      ? sectionsFromSummary(cs.summary)
      : [];

  const { prev, next } = await getAdjacentArticles(cs.date);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .a-page {
          background: #fff;
          min-height: 100vh;
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .a-wrap {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .a-header {
          padding-top: 56px;
          padding-bottom: 40px;
        }

        .a-series {
          font-size: 13px;
          font-weight: 600;
          color: #3D6B4F;
          margin-bottom: 16px;
        }

        .a-title {
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 700;
          color: #111;
          line-height: 1.4;
          letter-spacing: -0.025em;
          margin-bottom: 16px;
          word-break: keep-all;
        }

        .a-meta {
          font-size: 14px;
          color: #aaa;
          line-height: 1.6;
        }

        .a-meta span + span::before {
          content: " · ";
        }

        .a-header-line {
          height: 1px;
          background: #eee;
          margin-bottom: 40px;
        }

        .a-scripture {
          padding: 20px 24px;
          background: #f9f9f7;
          border-left: 3px solid #3D6B4F;
          font-size: 15px;
          color: #3D6B4F;
          line-height: 1.65;
          font-weight: 500;
          margin-bottom: 48px;
          border-radius: 0 6px 6px 0;
        }

        .a-body {
          padding-bottom: 48px;
        }

        .a-section {
          margin-bottom: 0;
        }

        .a-section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 48px 0 36px;
        }

        .a-section-divider-line {
          flex: 1;
          height: 1px;
          background: #e8e8e8;
        }

        .a-section-divider-icon {
          width: 6px;
          height: 6px;
          background: #3D6B4F;
          border-radius: 50%;
          opacity: 0.4;
        }

        .a-sub {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          margin-bottom: 16px;
          line-height: 1.45;
          letter-spacing: -0.02em;
        }

        .a-p {
          font-size: 16.5px;
          color: #333;
          line-height: 1.85;
          word-break: keep-all;
          text-align: left;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }

        .a-p:last-child {
          margin-bottom: 0;
        }

        .a-yt {
          padding-bottom: 48px;
        }

        .a-yt-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #111;
          color: #fff;
          border-radius: 6px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }

        .a-yt-btn:hover { background: #333; }

        /* 이전/다음 아티클 네비게이션 */
        /* 이전/다음 — 매거진 리스트 */
        .a-nav-section { padding: 56px 0 64px; }

        .a-nav-head {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 12px; border-bottom: 2px solid #111;
        }
        .a-nav-head-label { font-size: 15px; font-weight: 700; color: #111; letter-spacing: -0.01em; }
        .a-nav-head-more {
          font-size: 13px; color: #aaa; text-decoration: none;
          display: flex; align-items: center; gap: 4px; transition: color 0.15s;
        }
        .a-nav-head-more:hover { color: #3D6B4F; }

        .a-nav-item {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; padding: 22px 0; border-bottom: 1px solid #eee;
          text-decoration: none; transition: opacity 0.15s;
        }
        .a-nav-item:hover { opacity: 0.65; }

        .a-nav-item-body { flex: 1; min-width: 0; }
        .a-nav-item-title {
          font-size: 17px; font-weight: 700; color: #111; line-height: 1.45;
          word-break: keep-all; letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .a-nav-item-thumb {
          width: 80px; height: 80px; border-radius: 6px;
          object-fit: cover; flex-shrink: 0; background: #eee;
        }
        .a-nav-item-date { font-size: 13px; color: #3D6B4F; margin-top: 10px; }

        .a-footer-mini {
          text-align: center;
          padding: 0 0 48px;
        }

        .a-footer-mini span {
          font-size: 13px;
          color: #bbb;
        }

        @media (max-width: 480px) {
          .a-wrap { padding: 0 20px; }
          .a-header { padding-top: 44px; padding-bottom: 32px; }
          .a-p { font-size: 15.5px; line-height: 1.8; }
          .a-section-divider { margin: 40px 0 28px; }
          .a-nav-articles { grid-template-columns: 1fr; gap: 32px; }
          .a-nav-divider { display: none; }
          .a-nav-item--next { align-items: flex-start; text-align: left; }
          .a-nav-item--next .a-nav-dir { flex-direction: row; }
          .a-nav-title { font-size: 16px; }
        }
      `}</style>

      <div className="a-page">
        <PageHeader />
        <ScrollProgress />
        <div className="a-wrap">
          {/* 헤더 */}
          <div className="a-header">
            {cs.series && <div className="a-series">{cs.series}</div>}
            <h1 className="a-title">{cs.title}</h1>
            <div className="a-meta">
              {cs.date && <span>{cs.date}</span>}
              {cs.scripture && <span>{cs.scripture}</span>}
            </div>
          </div>

          <div className="a-header-line" />

          {/* 성경구절 */}
          {cs.scripture && (
            <div className="a-scripture">{cs.scripture}</div>
          )}

          {/* 본문 */}
          {sections.length > 0 && (
            <div className="a-body">
              {sections.map((sec, si) => (
                <div key={si} className="a-section">
                  {si > 0 && (
                    <div className="a-section-divider">
                      <div className="a-section-divider-line" />
                      <div className="a-section-divider-icon" />
                      <div className="a-section-divider-line" />
                    </div>
                  )}
                  {sec.subtitle && <h2 className="a-sub">{sec.subtitle}</h2>}
                  {sec.paragraphs.map((p, pi) => (
                    <p key={pi} className="a-p">{p}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* 유튜브 */}
          {cs.youtube_url && (
            <div className="a-yt">
              <a href={cs.youtube_url} target="_blank" rel="noopener noreferrer" className="a-yt-btn">
                ▶ 설교 영상 보기
              </a>
            </div>
          )}

          {/* 추천 콘텐츠 — 매거진 리스트 */}
          <div className="a-nav-section">
            <div className="a-nav-head">
              <span className="a-nav-head-label">추천 아티클</span>
              <Link href="/archive" className="a-nav-head-more">전체보기 &rsaquo;</Link>
            </div>

            {prev && (
              <Link href={`/article/${prev.slug || prev.id}`} className="a-nav-item">
                <div className="a-nav-item-body">
                  <div className="a-nav-item-title">{prev.title}</div>
                  {prev.date && <div className="a-nav-item-date">{prev.date}</div>}
                </div>
              </Link>
            )}
            {next && (
              <Link href={`/article/${next.slug || next.id}`} className="a-nav-item">
                <div className="a-nav-item-body">
                  <div className="a-nav-item-title">{next.title}</div>
                  {next.date && <div className="a-nav-item-date">{next.date}</div>}
                </div>
              </Link>
            )}
          </div>

          {/* 미니 푸터 */}
          <div className="a-footer-mini">
            <span>나무카드 · 나무십자가교회</span>
          </div>
        </div>
      </div>
    </>
  );
}
