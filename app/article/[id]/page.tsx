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
        color: "#666",
        background: "#111",
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
          background: #111;
          min-height: 100vh;
          color: #E5E5E5;
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
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to bottom, rgba(17,17,17,0.95) 60%, transparent);
        }

        .a-nav-brand {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .a-nav-link {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-weight: 500;
        }

        .a-nav-link:hover { color: rgba(255,255,255,0.8); }

        /* 히어로 */
        .a-hero {
          padding: 100px 24px 48px;
          max-width: 680px;
          margin: 0 auto;
        }

        .a-tag {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          color: #3D6B4F;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          padding: 6px 12px;
          background: rgba(61, 107, 79, 0.12);
          border-radius: 4px;
        }

        .a-title {
          font-size: clamp(26px, 5vw, 36px);
          font-weight: 800;
          color: #fff;
          line-height: 1.35;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          word-break: keep-all;
        }

        .a-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        .a-meta-sep {
          width: 1px;
          height: 12px;
          background: rgba(255,255,255,0.15);
        }

        /* 성경구절 */
        .a-quote {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 40px;
        }

        .a-quote-inner {
          padding: 20px 24px;
          background: rgba(61, 107, 79, 0.08);
          border-left: 3px solid #3D6B4F;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
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
          background: rgba(255,255,255,0.08);
        }

        /* 본문 */
        .a-body {
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .a-section {
          margin-bottom: 36px;
        }

        .a-section:last-child {
          margin-bottom: 0;
        }

        .a-sub {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          line-height: 1.4;
        }

        .a-p {
          font-size: 16px;
          color: rgba(255,255,255,0.72);
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
          background: #fff;
          color: #111;
          border-radius: 100px;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: opacity 0.2s;
        }

        .a-yt-btn:hover { opacity: 0.85; }

        .a-yt-icon {
          width: 0;
          height: 0;
          border-left: 7px solid #111;
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
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .a-footer-brand {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: -0.02em;
        }

        .a-footer-link {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          font-weight: 500;
        }

        .a-footer-link:hover { color: rgba(255,255,255,0.5); }

        @media (max-width: 480px) {
          .a-hero { padding: 80px 20px 36px; }
          .a-quote { padding: 0 20px 32px; }
          .a-body { padding: 32px 20px; }
          .a-yt { padding: 12px 20px 40px; }
          .a-footer { padding: 0 20px 60px; }
          .a-hr { padding: 0 20px; }
          .a-p { font-size: 15px; line-height: 1.8; }
          .a-title { margin-bottom: 16px; }
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
