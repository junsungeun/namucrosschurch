import { supabase, CardSet, CardTextData } from "@/lib/supabase";
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

/** cards_data JSON → 섹션 배열 */
function sectionsFromCardsData(data: CardTextData[]): Section[] {
  return data.map((card) => ({
    subtitle: card.subtitle || undefined,
    paragraphs: card.content.split("\n").filter(Boolean),
  }));
}

/** summary 텍스트 → 섹션 배열 (레거시 폴백) */
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
        fontFamily: '"Suit", sans-serif',
        color: "#999",
      }}>
        말씀 카드를 찾을 수 없습니다
      </div>
    );
  }

  // cards_data 우선, 없으면 summary 폴백
  const sections = cs.cards_data?.length
    ? sectionsFromCardsData(cs.cards_data)
    : cs.summary
      ? sectionsFromSummary(cs.summary)
      : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap');

        .article-page {
          background: #fff;
          min-height: 100vh;
        }

        /* 히어로 영역 */
        .article-hero {
          padding: 120px 24px 60px;
          max-width: 640px;
          margin: 0 auto;
        }

        .article-label {
          font-family: 'Suit', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3D6B4F;
          margin-bottom: 28px;
        }

        .article-title {
          font-family: 'Noto Serif KR', serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.35;
          letter-spacing: -0.025em;
          margin: 0 0 24px;
          word-break: keep-all;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Suit', sans-serif;
          font-size: 13px;
          color: #999;
        }

        .article-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #ccc;
        }

        /* 성경구절 인용 */
        .article-scripture {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }

        .article-scripture-inner {
          border-left: 3px solid #3D6B4F;
          padding: 16px 0 16px 20px;
          font-family: 'Noto Serif KR', serif;
          font-size: 16px;
          color: #3D6B4F;
          line-height: 1.7;
          font-style: italic;
        }

        /* 구분선 */
        .article-divider {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .article-divider-line {
          height: 1px;
          background: #E8E8E8;
        }

        /* 본문 영역 */
        .article-body {
          max-width: 640px;
          margin: 0 auto;
          padding: 48px 24px 40px;
        }

        .article-section {
          margin-bottom: 40px;
        }

        .article-section:last-child {
          margin-bottom: 0;
        }

        .article-subtitle {
          font-family: 'Suit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #3D6B4F;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(61, 107, 79, 0.15);
          display: inline-block;
        }

        .article-paragraph {
          font-family: 'Noto Serif KR', serif;
          font-size: 17px;
          color: #2A2A2A;
          line-height: 2;
          word-break: keep-all;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }

        .article-paragraph:last-child {
          margin-bottom: 0;
        }

        /* 유튜브 버튼 */
        .article-youtube {
          max-width: 640px;
          margin: 0 auto;
          padding: 8px 24px 48px;
        }

        .article-youtube-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #1A1A1A;
          color: #fff;
          border-radius: 100px;
          padding: 16px 32px;
          font-family: 'Suit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.2s;
        }

        .article-youtube-btn:hover {
          background: #333;
        }

        .article-youtube-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .article-youtube-icon svg {
          margin-left: 2px;
        }

        /* 푸터 */
        .article-footer {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .article-footer-inner {
          border-top: 1px solid #E8E8E8;
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .article-footer-brand {
          font-family: 'Noto Serif KR', serif;
          font-size: 15px;
          font-weight: 700;
          color: #3D6B4F;
        }

        .article-footer-link {
          font-family: 'Suit', sans-serif;
          font-size: 12px;
          color: #999;
          text-decoration: none;
          letter-spacing: 0.03em;
        }

        .article-footer-link:hover {
          color: #666;
        }

        /* 모바일 최적화 */
        @media (max-width: 480px) {
          .article-hero { padding: 80px 20px 40px; }
          .article-scripture { padding: 0 20px 36px; }
          .article-body { padding: 36px 20px 32px; }
          .article-youtube { padding: 8px 20px 36px; }
          .article-footer { padding: 0 20px 60px; }
          .article-divider { padding: 0 20px; }
          .article-paragraph { font-size: 16px; line-height: 1.9; }
        }
      `}</style>

      <div className="article-page">
        {/* 히어로 */}
        <div className="article-hero">
          <div className="article-label">
            나무십자가교회{cs.series ? ` · ${cs.series}` : ""}
          </div>
          <h1 className="article-title">{cs.title}</h1>
          <div className="article-meta">
            {cs.date && <span>{cs.date}</span>}
            {cs.date && cs.scripture && <span className="article-meta-dot" />}
            {cs.scripture && <span>{cs.scripture}</span>}
          </div>
        </div>

        {/* 성경구절 인용 블록 */}
        {cs.scripture && (
          <div className="article-scripture">
            <div className="article-scripture-inner">
              {cs.scripture}
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="article-divider">
          <div className="article-divider-line" />
        </div>

        {/* 본문 */}
        {sections.length > 0 && (
          <div className="article-body">
            {sections.map((sec, si) => (
              <div key={si} className="article-section">
                {sec.subtitle && (
                  <div className="article-subtitle">{sec.subtitle}</div>
                )}
                {sec.paragraphs.map((p, pi) => (
                  <p key={pi} className="article-paragraph">{p}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 유튜브 버튼 */}
        {cs.youtube_url && (
          <div className="article-youtube">
            <a
              href={cs.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-youtube-btn"
            >
              <span className="article-youtube-icon">
                <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                  <path d="M1 1L7 5L1 9V1Z" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              설교 영상 보기
            </a>
          </div>
        )}

        {/* 푸터 */}
        <div className="article-footer">
          <div className="article-footer-inner">
            <div className="article-footer-brand">나무카드.</div>
            <Link href="/" className="article-footer-link">
              나무십자가교회
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
