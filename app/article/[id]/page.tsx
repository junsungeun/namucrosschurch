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
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* 헤더 */
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

        /* 헤더-본문 구분 */
        .a-header-line {
          height: 1px;
          background: #eee;
          margin-bottom: 40px;
        }

        /* 성경구절 */
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

        /* 본문 */
        .a-body {
          padding-bottom: 48px;
        }

        /* 섹션: 소제목이 있는 섹션은 상단에 가로선으로 구분 */
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

        /* 유튜브 */
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
          color: #aaa;
          text-decoration: none;
        }

        .a-footer-link:hover { color: #666; }

        @media (max-width: 480px) {
          .a-wrap { padding: 0 20px; }
          .a-header { padding-top: 44px; padding-bottom: 32px; }
          .a-p { font-size: 15.5px; line-height: 1.8; }
          .a-section-divider { margin: 40px 0 28px; }
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
                  {/* 두 번째 섹션부터 구분선 */}
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
