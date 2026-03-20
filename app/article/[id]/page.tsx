import { supabase, CardSet, CardTextData } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .a-page {
          background: #fff;
          min-height: 100vh;
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .a-wrap {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* 헤더 */
        .a-header {
          padding-top: 60px;
          padding-bottom: 32px;
          border-bottom: 1px solid #eee;
          margin-bottom: 32px;
        }

        .a-series {
          font-size: 13px;
          font-weight: 600;
          color: #3D6B4F;
          margin-bottom: 12px;
        }

        .a-title {
          font-size: clamp(24px, 4.5vw, 32px);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.4;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          word-break: keep-all;
        }

        .a-meta {
          font-size: 14px;
          color: #999;
        }

        .a-meta span + span::before {
          content: " · ";
        }

        /* 성경구절 */
        .a-scripture {
          padding: 16px 20px;
          background: #f8f8f6;
          border-left: 3px solid #3D6B4F;
          font-size: 14px;
          color: #3D6B4F;
          line-height: 1.6;
          font-weight: 500;
          margin-bottom: 36px;
          border-radius: 0 4px 4px 0;
        }

        /* 본문 */
        .a-body {
          padding-bottom: 40px;
        }

        .a-section {
          margin-bottom: 32px;
        }

        .a-section:last-child {
          margin-bottom: 0;
        }

        .a-sub {
          font-size: 17px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .a-p {
          font-size: 16px;
          color: #333;
          line-height: 1.8;
          word-break: keep-all;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }

        .a-p:last-child {
          margin-bottom: 0;
        }

        /* 유튜브 */
        .a-yt {
          padding-bottom: 40px;
        }

        .a-yt-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1A1A1A;
          color: #fff;
          border-radius: 6px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }

        .a-yt-btn:hover { background: #333; }

        /* 푸터 */
        .a-footer {
          border-top: 1px solid #eee;
          padding: 24px 0 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .a-footer-brand {
          font-size: 14px;
          font-weight: 700;
          color: #3D6B4F;
        }

        .a-footer-link {
          font-size: 13px;
          color: #999;
          text-decoration: none;
        }

        .a-footer-link:hover { color: #666; }

        @media (max-width: 480px) {
          .a-wrap { padding: 0 20px; }
          .a-header { padding-top: 48px; padding-bottom: 24px; margin-bottom: 24px; }
          .a-p { font-size: 15px; }
        }
      `}</style>

      <div className="a-page">
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

          {/* 성경구절 */}
          {cs.scripture && (
            <div className="a-scripture">{cs.scripture}</div>
          )}

          {/* 본문 */}
          {sections.length > 0 && (
            <div className="a-body">
              {sections.map((sec, si) => (
                <div key={si} className="a-section">
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

          {/* 푸터 */}
          <div className="a-footer">
            <div className="a-footer-brand">나무카드.</div>
            <Link href="/" className="a-footer-link">나무십자가교회</Link>
          </div>
        </div>
      </div>
    </>
  );
}
