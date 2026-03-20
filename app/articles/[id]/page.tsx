import { supabase, Article } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import ScrollProgress from "@/app/article/[id]/ScrollProgress";
import PageHeader from "@/components/PageHeader";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("articles").select("id, slug");
    return (data ?? []).map((a: { id: string; slug?: string }) => ({
      id: a.slug || a.id,
    }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ id: string }> };

async function getArticle(idOrSlug: string): Promise<Article | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(idOrSlug);
    const column = isUuid ? "id" : "slug";
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq(column, idOrSlug)
      .single();
    return data as Article | null;
  } catch {
    return null;
  }
}

async function getAdjacentArticles(currentDate: string) {
  const prev = await supabase
    .from("articles")
    .select("id, slug, title, date")
    .lt("date", currentDate)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const next = await supabase
    .from("articles")
    .select("id, slug, title, date")
    .gt("date", currentDate)
    .order("date", { ascending: true })
    .limit(1)
    .single();

  return {
    prev: prev.data as Pick<Article, "id" | "slug" | "title" | "date"> | null,
    next: next.data as Pick<Article, "id" | "slug" | "title" | "date"> | null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: "나무카드" };
  return {
    title: article.title,
    description: `${article.scripture}${article.series ? ` · ${article.series}` : ""}`,
  };
}

export default async function ArticleViewPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: '"Pretendard", -apple-system, sans-serif', color: "#999",
      }}>
        아티클을 찾을 수 없습니다
      </div>
    );
  }

  const { prev, next } = await getAdjacentArticles(article.date);
  const hasMeditation = article.god_father || article.god_son || article.god_spirit;

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

        .a-wrap { max-width: 640px; margin: 0 auto; padding: 0 24px; }

        .a-header { padding-top: 56px; padding-bottom: 40px; }

        .a-series { font-size: 13px; font-weight: 600; color: #3D6B4F; margin-bottom: 16px; }

        .a-title {
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 700; color: #111; line-height: 1.4;
          letter-spacing: -0.025em; margin-bottom: 16px; word-break: keep-all;
        }

        .a-meta { font-size: 14px; color: #aaa; line-height: 1.6; }
        .a-meta span + span::before { content: " · "; }

        .a-header-line { height: 1px; background: #eee; margin-bottom: 40px; }

        .a-scripture {
          padding: 20px 24px; background: #f9f9f7;
          border-left: 3px solid #3D6B4F; font-size: 15px; color: #3D6B4F;
          line-height: 1.65; font-weight: 500; margin-bottom: 48px;
          border-radius: 0 6px 6px 0;
        }

        .a-body { padding-bottom: 48px; }

        .a-body p { font-size: 16.5px; color: #333; line-height: 1.85; word-break: keep-all; margin-bottom: 20px; letter-spacing: -0.01em; }
        .a-body h1 { font-size: 22px; font-weight: 700; color: #111; margin: 36px 0 16px; line-height: 1.4; letter-spacing: -0.02em; }
        .a-body h2 { font-size: 19px; font-weight: 700; color: #111; margin: 32px 0 14px; line-height: 1.4; letter-spacing: -0.02em; }
        .a-body h3 { font-size: 17px; font-weight: 700; color: #111; margin: 28px 0 12px; line-height: 1.4; }
        .a-body strong { font-weight: 700; }
        .a-body em { font-style: italic; }

        /* 디자인 마커 */
        .a-body .dm-green  { background-image: linear-gradient(transparent 55%, rgba(61,107,79,0.25) 55%); }
        .a-body .dm-amber  { background-image: linear-gradient(transparent 55%, rgba(196,135,58,0.28) 55%); }
        .a-body .dm-blue   { background-image: linear-gradient(transparent 55%, rgba(94,160,220,0.28) 55%); }
        .a-body .dm-pink   { background-image: linear-gradient(transparent 55%, rgba(210,100,120,0.25) 55%); }

        .a-yt { padding-bottom: 48px; }
        .a-yt-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #111; color: #fff; border-radius: 6px; padding: 12px 20px;
          font-size: 14px; font-weight: 600; text-decoration: none; transition: background 0.15s;
        }
        .a-yt-btn:hover { background: #333; }

        /* 말씀 묵상 섹션 */
        .a-meditation { padding-bottom: 48px; }

        .a-meditation-label {
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          color: #aaa; margin-bottom: 20px; text-transform: uppercase;
        }

        .a-meditation-card {
          border-left: 3px solid #3D6B4F;
          padding: 20px 24px; background: #f9f9f7;
          border-radius: 0 8px 8px 0; margin-bottom: 12px;
        }

        .a-meditation-title {
          font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
          margin-bottom: 10px;
        }

        .a-meditation-body p { font-size: 15px; color: #333; line-height: 1.8; margin-bottom: 12px; }
        .a-meditation-body p:last-child { margin-bottom: 0; }
        .a-meditation-body strong { font-weight: 700; }
        .a-meditation-body em { font-style: italic; }
        .a-meditation-body .dm-green  { background-image: linear-gradient(transparent 55%, rgba(61,107,79,0.25) 55%); }
        .a-meditation-body .dm-amber  { background-image: linear-gradient(transparent 55%, rgba(196,135,58,0.28) 55%); }
        .a-meditation-body .dm-blue   { background-image: linear-gradient(transparent 55%, rgba(94,160,220,0.28) 55%); }
        .a-meditation-body .dm-pink   { background-image: linear-gradient(transparent 55%, rgba(210,100,120,0.25) 55%); }

        /* 이전/다음 — 매거진 리스트 */
        .a-nav-section { padding: 56px 0 64px; }

        .a-nav-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0; padding-bottom: 12px; border-bottom: 2px solid #111;
        }
        .a-nav-head-label {
          font-size: 15px; font-weight: 700; color: #111; letter-spacing: -0.01em;
        }
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
        .a-nav-item-date { font-size: 13px; color: #3D6B4F; margin-top: 10px; }

        .a-footer-mini { text-align: center; padding: 48px 0; }
        .a-footer-mini span { font-size: 13px; color: #bbb; }

        @media (max-width: 480px) {
          .a-wrap { padding: 0 20px; }
          .a-header { padding-top: 44px; padding-bottom: 32px; }
          .a-body p { font-size: 15.5px; line-height: 1.8; }
          .a-nav-item-title { font-size: 15px; }
        }
      `}</style>

      <div className="a-page">
        <PageHeader />
        <ScrollProgress />
        <div className="a-wrap">

          {/* 헤더 */}
          <div className="a-header">
            {article.series && <div className="a-series">{article.series}</div>}
            <h1 className="a-title">{article.title}</h1>
            <div className="a-meta">
              {article.date && <span>{article.date}</span>}
              {article.scripture && <span>{article.scripture}</span>}
            </div>
          </div>

          <div className="a-header-line" />

          {/* 성경 본문 */}
          <div className="a-scripture">{article.scripture}</div>

          {/* 본문 */}
          {article.body && (
            <div
              className="a-body"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          )}

          {/* 유튜브 */}
          {article.youtube_url && (
            <div className="a-yt">
              <a href={article.youtube_url} target="_blank" rel="noopener noreferrer" className="a-yt-btn">
                ▶ 설교 영상 보기
              </a>
            </div>
          )}

          {/* 말씀 묵상 */}
          {hasMeditation && (
            <div className="a-meditation">
              <div className="a-meditation-label">말씀 묵상</div>
              {article.god_father && (
                <div className="a-meditation-card" style={{ borderLeftColor: "#3D6B4F" }}>
                  <div className="a-meditation-title" style={{ color: "#3D6B4F" }}>하나님 찾기</div>
                  <div className="a-meditation-body" dangerouslySetInnerHTML={{ __html: article.god_father }} />
                </div>
              )}
              {article.god_son && (
                <div className="a-meditation-card" style={{ borderLeftColor: "#5EA0DC" }}>
                  <div className="a-meditation-title" style={{ color: "#5EA0DC" }}>예수님 찾기</div>
                  <div className="a-meditation-body" dangerouslySetInnerHTML={{ __html: article.god_son }} />
                </div>
              )}
              {article.god_spirit && (
                <div className="a-meditation-card" style={{ borderLeftColor: "#C4873A" }}>
                  <div className="a-meditation-title" style={{ color: "#C4873A" }}>성령님 찾기</div>
                  <div className="a-meditation-body" dangerouslySetInnerHTML={{ __html: article.god_spirit }} />
                </div>
              )}
            </div>
          )}

          {/* 추천 콘텐츠 — 매거진 리스트 */}
          <div className="a-nav-section">
            <div className="a-nav-head">
              <span className="a-nav-head-label">추천 콘텐츠</span>
              <Link href="/archive?tab=articles" className="a-nav-head-more">전체보기 &rsaquo;</Link>
            </div>

            {prev && (
              <Link href={`/articles/${prev.slug || prev.id}`} className="a-nav-item">
                <div className="a-nav-item-body">
                  <div className="a-nav-item-title">{prev.title}</div>
                  {prev.date && <div className="a-nav-item-date">{prev.date}</div>}
                </div>
              </Link>
            )}
            {next && (
              <Link href={`/articles/${next.slug || next.id}`} className="a-nav-item">
                <div className="a-nav-item-body">
                  <div className="a-nav-item-title">{next.title}</div>
                  {next.date && <div className="a-nav-item-date">{next.date}</div>}
                </div>
              </Link>
            )}
            {!prev && !next && (
              <Link href="/archive" className="a-nav-item">
                <div className="a-nav-item-body">
                  <div className="a-nav-item-title">아티클 전체 보기</div>
                  <div className="a-nav-item-date">보관함으로 이동</div>
                </div>
              </Link>
            )}
          </div>

          {/* 푸터 */}
          <div className="a-footer-mini">
            <span>나무카드 · 나무십자가교회</span>
          </div>
        </div>
      </div>
    </>
  );
}
