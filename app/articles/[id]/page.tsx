import { supabase, Article } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: "나무카드" };
  return {
    title: article.title,
    description: `${article.scripture} · ${article.series ?? ""}`.trim().replace(/·\s*$/, ""),
  };
}

export default async function ArticleViewPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return (
      <div className="page-shell">
        <PageHeader />
        <main className="page-main" style={{ textAlign: "center", paddingTop: 80 }}>
          <p className="sub-text">아티클을 찾을 수 없습니다.</p>
          <Link href="/archive" className="btn btn-secondary" style={{ marginTop: 16, display: "inline-flex" }}>보관함으로</Link>
        </main>
      </div>
    );
  }

  const hasMeditation = article.god_father || article.god_son || article.god_spirit;

  return (
    <div className="page-shell">
      <PageHeader />
      <main className="page-main" style={{ maxWidth: 720 }}>

        {/* 상단 메타 */}
        <div style={{ marginBottom: 40 }}>
          {(article.series || article.date) && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 10, fontFamily: "var(--f-body)" }}>
              {[article.date, article.series].filter(Boolean).join(" · ")}
            </div>
          )}
          <h1 style={{ fontFamily: "var(--f-head)", fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1.3, marginBottom: 12 }}>
            {article.title}
          </h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--bg-subtle)", borderRadius: 8, padding: "8px 14px" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>본문</span>
            <span style={{ fontFamily: "var(--f-head)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{article.scripture}</span>
          </div>
        </div>

        {/* 본문 */}
        {article.body && (
          <div
            className="card-html-body article-body"
            dangerouslySetInnerHTML={{ __html: article.body }}
            style={{ marginBottom: 48 }}
          />
        )}

        {/* 유튜브 버튼 */}
        {article.youtube_url && (
          <div style={{ marginBottom: 48 }}>
            <a
              href={article.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <span style={{ fontSize: 14 }}>▶</span>
              설교 영상 보기
            </a>
          </div>
        )}

        {/* 말씀 묵상 요약 */}
        {hasMeditation && (
          <div style={{ borderTop: "2px solid var(--border)", paddingTop: 36, marginBottom: 48 }}>
            <div style={{ fontFamily: "var(--f-head)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 20 }}>
              말씀 묵상
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {article.god_father && (
                <MeditationCard
                  accentColor="#3D6B4F"
                  label="하나님 찾기"
                  html={article.god_father}
                />
              )}
              {article.god_son && (
                <MeditationCard
                  accentColor="#5EA0DC"
                  label="예수님 찾기"
                  html={article.god_son}
                />
              )}
              {article.god_spirit && (
                <MeditationCard
                  accentColor="#C4873A"
                  label="성령님 찾기"
                  html={article.god_spirit}
                />
              )}
            </div>
          </div>
        )}

        {/* 보관함으로 */}
        <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <Link href="/archive" className="btn btn-secondary" style={{ fontSize: 13 }}>
            ← 보관함으로
          </Link>
        </div>
      </main>
      <footer className="page-footer"><p>나무카드 · 나무십자가교회 · made by tomob</p></footer>
    </div>
  );
}

function MeditationCard({ accentColor, label, html }: {
  accentColor: string; label: string; html: string;
}) {
  return (
    <div className="card-box" style={{ borderLeft: `3px solid ${accentColor}`, padding: "20px 24px" }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--f-head)", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", color: accentColor }}>{label}</span>
      </div>
      <div
        className="card-html-body article-body"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontSize: 15 }}
      />
    </div>
  );
}
