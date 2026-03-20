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
        fontFamily: '"Pretendard", "Suit", -apple-system, sans-serif',
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
          background: #FAFAF8;
          min-height: 100vh;
          color: #1A1A1A;
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, 'Suit', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* 상단 네비 */
        .a-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .a-nav-brand {
          font-size: 15px;
          font-weight: 700;
          color: #3D6B4F;
          letter-spacing: -0.02em;
        }

        .a-nav-link {
          font-size: 13px;
          color: #999;
          text-decoration: none;
          font-weight: 500;
        }

        .a-nav-link:hover { color: #666; }

        /* 히어로 */
        .a-hero {
          padding: 100px 24px 0;
          max-width: 680px;
          margin: 0 auto;
        }

        .a-tag {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          color: #3D6B4F;
          letter-spacing: 0.04em;
          margin-bottom: 20px;
        }

        .a-title {
          font-size: clamp(28px, 5vw, 38px);
          font-weight: 800;
          color: #1A1A1A;
          line-height: 1.35;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          word-break: keep-all;
        }

        .a-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #999;
          font-weight: 400;
          padding-bottom: 32px;
        }

        .a-meta-sep {
          width: 1px;
          height: 12px;
          background: #ddd;
        }

        /* 성경구절 */
        .a-quote {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 36px;
        }

        .a-quote-inner {
          padding: 20px 24px;
          background: rgba(61, 107, 79, 0.06);
          border-left: 3px solid #3D6B4F;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          color: #3D6B4F;
          line-height: 1.7;
          font-weight: 500;
        }

        /* 구분선 */
        .a-hr {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .a-hr-line {
          height: 1px;
          background: #E8E8E8;
        }

        /* 본문 */
        .a-body {
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .a-section {
          margin-bottom: 40px;
        }

        .a-section:last-child {
          margin-bottom: 0;
        }

        .a-sub {
          font-size: 20px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          line-height: 1.4;
        }

        .a-p {
          font-size: 16px;
          color: #444;
          line-height: 1.85;
          word-break: keep-all;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
          font-weight: 400;
        }

        .a-p:last-child {
          margin-bottom: 0;
        }

        /* 유튜브 */
        .a-yt {
          max-width: 680px;
          margin: 0 auto;
          padding: 12px 24px 48px;
        }

        .a-yt-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #1A1A1A;
          color: #fff;
          border-radius: 100px;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: background 0.2s;
        }

        .a-yt-btn:hover { background: #333; }

        .a-yt-icon {
          width: 0;
          height: 0;
          border-left: 7px solid #fff;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
        }

        /* 푸터 */
        .a-footer {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .a-footer-inner {
          border-top: 1px solid #E8E8E8;
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .a-footer-brand {
          font-size: 14px;
          font-weight: 700;
          color: #3D6B4F;
          letter-spacing: -0.02em;
        }

        .a-footer-link {
          font-size: 12px;
          color: #999;
          text-decoration: none;
          font-weight: 500;
        }

        .a-footer-link:hover { color: #666; }

        @media (max-width: 480px) {
          .a-hero { padding: 80px 20px 0; }
          .a-quote { padding: 0 20px 28px; }
          .a-body { padding: 32px 20px; }
          .a-yt { padding: 12px 20px 40px; }
          .a-footer { padding: 0 20px 60px; }
          .a-hr { padding: 0 20px; }
          .a-p { font-size: 15px; line-height: 1.8; }
        }
      `}</style>

      <div className="a-page">
        {/* 상단 네비 */}
        <nav className="a-nav">
          <span className="a-nav-brand">나무카드.</span>
          <Link href="/" className="a-nav-link">나무십자가교회</Link>
        </nav>

        {/* 히어로 */}
        <div className="a-hero">
          <div className="a-tag">
            {cs.series || "나무십자가교회"}
          </div>
          <h1 className="a-title">{cs.title}</h1>
          <div className="a-meta">
            {cs.date && <span>{cs.date}</span>}
            {cs.date && cs.scripture && <div className="a-meta-sep" />}
            {cs.scripture && <span>{cs.scripture}</span>}
          </div>
        </div>

        {/* 성경구절 인용 */}
        {cs.scripture && (
          <div className="a-quote">
            <div className="a-quote-inner">
              {cs.scripture}
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="a-hr">
          <div className="a-hr-line" />
        </div>

        {/* 본문 */}
        {sections.length > 0 && (
          <div className="a-body">
            {sections.map((sec, si) => (
              <div key={si} className="a-section">
                {sec.subtitle && (
                  <h2 className="a-sub">{sec.subtitle}</h2>
                )}
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
              <span className="a-yt-icon" />
              설교 영상 보기
            </a>
          </div>
        )}

        {/* 푸터 */}
        <div className="a-footer">
          <div className="a-footer-inner">
            <div className="a-footer-brand">나무카드.</div>
            <Link href="/" className="a-footer-link">나무십자가교회</Link>
          </div>
        </div>
      </div>
    </>
  );
}
