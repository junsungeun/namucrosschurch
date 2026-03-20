import { supabase, CardSet, CardTextData } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  // 첫 번째 섹션의 첫 문단을 리드 문단으로 분리
  const leadParagraph = sections[0]?.paragraphs?.[0] || null;

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .a-page {
          background: #fff;
          min-height: 100vh;
          color: #1A1A1A;
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, 'Suit', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── 상단 컬러 바 ── */
        .a-topbar {
          height: 4px;
          background: linear-gradient(90deg, #3D6B4F, #5A9E6F);
        }

        /* ── 네비 ── */
        .a-nav {
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
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

        /* ── 히어로 헤더 ── */
        .a-hero {
          background: #F5F5F0;
          padding: 64px 24px 56px;
        }

        .a-hero-inner {
          max-width: 680px;
          margin: 0 auto;
        }

        .a-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          background: #3D6B4F;
          padding: 5px 12px;
          border-radius: 100px;
          letter-spacing: 0.03em;
          margin-bottom: 24px;
        }

        .a-title {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          color: #1A1A1A;
          line-height: 1.3;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          word-break: keep-all;
        }

        .a-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #888;
          font-weight: 400;
        }

        .a-meta-sep {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ccc;
        }

        /* ── 리드 문단 (첫 문단 강조) ── */
        .a-lead {
          max-width: 680px;
          margin: 0 auto;
          padding: 48px 24px 0;
        }

        .a-lead p {
          font-size: 19px;
          font-weight: 500;
          color: #1A1A1A;
          line-height: 1.8;
          word-break: keep-all;
          letter-spacing: -0.01em;
        }

        .a-lead p::first-letter {
          font-size: 3.2em;
          font-weight: 800;
          float: left;
          line-height: 0.85;
          margin-right: 8px;
          margin-top: 4px;
          color: #3D6B4F;
        }

        /* ── 성경구절 인용 ── */
        .a-quote {
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .a-quote-inner {
          position: relative;
          padding: 28px 28px 28px 24px;
          background: #F5F5F0;
          border-left: 4px solid #3D6B4F;
          border-radius: 0 12px 12px 0;
          font-size: 15px;
          color: #3D6B4F;
          line-height: 1.7;
          font-weight: 600;
        }

        .a-quote-mark {
          position: absolute;
          top: 12px;
          right: 20px;
          font-size: 48px;
          color: rgba(61, 107, 79, 0.12);
          font-weight: 800;
          line-height: 1;
        }

        /* ── 섹션 구분 ── */
        .a-divider {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .a-divider-line {
          flex: 1;
          height: 1px;
          background: #E5E5E0;
        }

        .a-divider-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3D6B4F;
          opacity: 0.3;
        }

        /* ── 본문 ── */
        .a-body {
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .a-section {
          margin-bottom: 48px;
        }

        .a-section:last-child {
          margin-bottom: 0;
        }

        .a-sub {
          font-size: 22px;
          font-weight: 800;
          color: #1A1A1A;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
          line-height: 1.35;
        }

        .a-sub-bar {
          width: 32px;
          height: 3px;
          background: #3D6B4F;
          border-radius: 2px;
          margin-bottom: 20px;
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

        /* ── 중간 강조 인용 ── */
        .a-pullquote {
          margin: 40px 0;
          padding: 32px 0;
          border-top: 1px solid #E5E5E0;
          border-bottom: 1px solid #E5E5E0;
          text-align: center;
        }

        .a-pullquote p {
          font-size: 18px;
          font-weight: 700;
          color: #3D6B4F;
          line-height: 1.6;
          word-break: keep-all;
          letter-spacing: -0.01em;
        }

        /* ── 유튜브 ── */
        .a-yt {
          max-width: 680px;
          margin: 0 auto;
          padding: 12px 24px 56px;
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

        /* ── 하단 CTA 카드 ── */
        .a-bottom-card {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 56px;
        }

        .a-bottom-card-inner {
          background: #F5F5F0;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }

        .a-bottom-card-inner p {
          font-size: 14px;
          color: #888;
          margin-bottom: 12px;
        }

        .a-bottom-card-inner strong {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #1A1A1A;
        }

        /* ── 푸터 ── */
        .a-footer {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .a-footer-inner {
          border-top: 1px solid #E8E8E8;
          padding-top: 24px;
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
          .a-hero { padding: 48px 20px 44px; }
          .a-lead { padding: 36px 20px 0; }
          .a-lead p { font-size: 17px; }
          .a-lead p::first-letter { font-size: 2.8em; }
          .a-quote { padding: 32px 20px; }
          .a-body { padding: 32px 20px; }
          .a-yt { padding: 12px 20px 40px; }
          .a-bottom-card { padding: 0 20px 40px; }
          .a-footer { padding: 0 20px 60px; }
          .a-divider { padding: 0 20px; }
          .a-p { font-size: 15px; line-height: 1.8; }
          .a-sub { font-size: 20px; }
          .a-pullquote p { font-size: 16px; }
        }
      `}</style>

      <div className="a-page">
        {/* 상단 컬러 바 */}
        <div className="a-topbar" />

        {/* 네비 */}
        <nav className="a-nav">
          <span className="a-nav-brand">나무카드.</span>
          <Link href="/" className="a-nav-link">나무십자가교회</Link>
        </nav>

        {/* 히어로 헤더 */}
        <div className="a-hero">
          <div className="a-hero-inner">
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
        </div>

        {/* 리드 문단 (첫 문단 크게) */}
        {leadParagraph && (
          <div className="a-lead">
            <p>{leadParagraph}</p>
          </div>
        )}

        {/* 성경구절 인용 */}
        {cs.scripture && (
          <div className="a-quote">
            <div className="a-quote-inner">
              <span className="a-quote-mark">&ldquo;</span>
              {cs.scripture}
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="a-divider">
          <div className="a-divider-line" />
          <div className="a-divider-dot" />
          <div className="a-divider-line" />
        </div>

        {/* 본문 */}
        {sections.length > 0 && (
          <div className="a-body">
            {sections.map((sec, si) => {
              // 첫 섹션의 첫 문단은 리드로 이미 표시했으므로 제외
              const paragraphs = si === 0 ? sec.paragraphs.slice(1) : sec.paragraphs;
              if (!sec.subtitle && paragraphs.length === 0) return null;

              // 마지막 섹션 직전에 pullquote 삽입
              const showPullquote = si === Math.floor(sections.length / 2) && sections.length > 2;

              return (
                <div key={si}>
                  {showPullquote && sections[si - 1] && (
                    <div className="a-pullquote">
                      <p>{sections[si - 1].paragraphs[sections[si - 1].paragraphs.length - 1]}</p>
                    </div>
                  )}
                  <div className="a-section">
                    {sec.subtitle && (
                      <>
                        <h2 className="a-sub">{sec.subtitle}</h2>
                        <div className="a-sub-bar" />
                      </>
                    )}
                    {paragraphs.map((p, pi) => (
                      <p key={pi} className="a-p">{p}</p>
                    ))}
                  </div>
                </div>
              );
            })}
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

        {/* 하단 카드 */}
        <div className="a-bottom-card">
          <div className="a-bottom-card-inner">
            <p>매주 말씀을 카드로 만나보세요</p>
            <strong>나무십자가교회 말씀카드</strong>
          </div>
        </div>

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
