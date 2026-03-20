"use client";

import { useState, useEffect, useRef } from "react";
import { CardSet, Article } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

type Props = { cardsets: CardSet[]; articles: Article[] };

/* ── 오프닝 ── */
function OpeningOverlay({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 60);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => onDone(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "#0D1A12",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: phase === 2 ? 0 : 1,
      transition: phase === 0 ? "none" : "opacity 0.65s ease",
      pointerEvents: phase === 2 ? "none" : "auto",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
          fontSize: "clamp(36px, 8vw, 72px)", color: "#fff", letterSpacing: "0.04em",
          opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(20px)",
          transition: "opacity 0.85s ease, transform 0.85s ease",
        }}>NAMUCROSS</div>
        <div style={{
          fontSize: "clamp(11px, 2vw, 15px)", color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.32em", marginTop: 10,
          opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(10px)",
          transition: "opacity 0.85s ease 0.2s, transform 0.85s ease 0.2s",
        }}>.CHURCH</div>
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function HomeClient({ cardsets, articles }: Props) {
  const [showOpening, setShowOpening] = useState(false);
  const [tab, setTab] = useState<"cards" | "articles">("cards");
  const router = useRouter();
  const { toast } = useToast();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteCardTarget, setDeleteCardTarget] = useState<CardSet | null>(null);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);
  const [deleteArticleTarget, setDeleteArticleTarget] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("nc_opened");
    if (!seen) { sessionStorage.setItem("nc_opened", "1"); setShowOpening(true); }
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  async function downloadCard(cs: CardSet) {
    setOpenMenu(null);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (let i = 0; i < cs.card_urls.length; i++) {
      const res = await fetch(cs.card_urls[i]);
      const blob = await res.blob();
      zip.file(`카드_${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url; a.download = `나무카드_${cs.date}.zip`; a.click();
  }

  function copyCardLink(cs: CardSet) {
    setOpenMenu(null);
    navigator.clipboard.writeText(`${window.location.origin}/article/${cs.slug || cs.id}`);
    toast("링크가 복사되었습니다!", "success");
  }

  function copyArticleLink(article: Article) {
    navigator.clipboard.writeText(`${window.location.origin}/articles/${article.slug || article.id}`);
    toast("링크가 복사되었습니다!", "success");
  }

  async function confirmDeleteCard() {
    if (!deleteCardTarget) return;
    setDeletingCard(deleteCardTarget.id); setDeleteCardTarget(null);
    try {
      const res = await fetch("/api/delete-cardset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteCardTarget.id, card_urls: deleteCardTarget.card_urls }),
      });
      if (!res.ok) { toast("삭제 실패", "error"); return; }
      toast("삭제 완료", "success"); router.refresh();
    } catch { toast("삭제 오류", "error"); } finally { setDeletingCard(null); }
  }

  async function confirmDeleteArticle() {
    if (!deleteArticleTarget) return;
    setDeletingArticle(deleteArticleTarget.id); setDeleteArticleTarget(null);
    try {
      const res = await fetch("/api/delete-article", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteArticleTarget.id }),
      });
      if (!res.ok) { toast("삭제 실패", "error"); return; }
      toast("삭제 완료", "success"); router.refresh();
    } catch { toast("삭제 오류", "error"); } finally { setDeletingArticle(null); }
  }

  return (
    <>
      {showOpening && <OpeningOverlay onDone={() => setShowOpening(false)} />}

      <style>{`
        .hc-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px 80px; }

        /* 카드 그리드 */
        .hc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px 20px;
        }
        @media (max-width: 860px) {
          .hc-grid { grid-template-columns: repeat(2, 1fr); gap: 28px 14px; }
        }
        @media (max-width: 480px) {
          .hc-grid { grid-template-columns: repeat(2, 1fr); gap: 20px 10px; }
          .hc-wrap { padding: 0 16px 60px; }
        }

        /* 카드 아이템 */
        .hc-card {
          position: relative;
        }
        .hc-card-img {
          width: 100%;
          padding-top: 125%; /* 4:5 비율 */
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #2D5A3D;
        }
        .hc-card-img img {
          position: absolute !important;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        .hc-card-date {
          font-size: 11px; color: #aaa;
          margin: 10px 0 3px; letter-spacing: 0.02em;
        }
        .hc-card-title {
          font-size: 14px; font-weight: 700; color: #111;
          line-height: 1.4; word-break: keep-all;
        }
        .hc-card-actions {
          display: flex; gap: 6px; margin-top: 8px;
        }
        .hc-act-btn {
          flex: 1; padding: 6px 0; font-size: 11px; font-weight: 500;
          color: #666; background: #f7f7f5; border: none;
          border-radius: 5px; cursor: pointer; text-align: center;
          transition: background 0.15s;
        }
        .hc-act-btn:hover { background: #eee; }
        .hc-act-btn--danger { color: #e05252; background: #fff3f3; }
        .hc-act-btn--danger:hover { background: #ffe0e0; }

        /* 아티클 리스트 */
        .hc-art-row {
          display: flex; align-items: center;
          padding: 20px 0; border-bottom: 1px solid #f0f0f0;
        }
        .hc-art-link {
          flex: 1; min-width: 0; text-decoration: none; transition: opacity 0.15s;
        }
        .hc-art-link:hover { opacity: 0.65; }
        .hc-art-date {
          font-size: 11px; font-weight: 600; color: #3D6B4F;
          letter-spacing: 0.05em; margin-bottom: 6px; text-transform: uppercase;
        }
        .hc-art-title {
          font-size: 18px; font-weight: 700; color: #111;
          line-height: 1.35; word-break: keep-all; letter-spacing: -0.02em;
        }
        .hc-art-scripture { font-size: 13px; color: #bbb; margin-top: 5px; }

        @media (max-width: 640px) {
          .hc-art-title { font-size: 15px; }
          .hc-art-row { padding: 16px 0; }
        }

        /* 탭 */
        .hc-tab {
          background: none; border: none; cursor: pointer;
          padding: 12px 0; margin-right: 28px;
          font-size: 14px; transition: all 0.15s;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--f-body)" }}>

        {/* 헤더 */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          height: 56, display: "flex", alignItems: "center", padding: "0 24px", gap: 10,
        }}>
          <Link href="/" style={{
            fontFamily: "var(--f-head)", fontWeight: 700, fontSize: 15,
            color: "#3D6B4F", textDecoration: "none",
          }}>나무카드.</Link>
          <div style={{ flex: 1 }} />
          <Link href="/article-editor" style={{
            fontSize: 13, color: "#555", textDecoration: "none",
            padding: "6px 14px", border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 7, fontWeight: 500,
          }}>아티클 작성</Link>
          <Link href="/create" style={{
            background: "#1E2E24", color: "#fff",
            padding: "7px 16px", borderRadius: 7, fontSize: 13,
            fontWeight: 600, textDecoration: "none",
          }}>카드뉴스 생성</Link>
        </header>

        <div className="hc-wrap">
          {/* 탭 */}
          <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 32, marginTop: 32 }}>
            {(["cards", "articles"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className="hc-tab" style={{
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? "#111" : "#bbb",
                borderBottomColor: tab === t ? "#111" : "transparent",
              }}>
                {t === "cards" ? "카드뉴스" : "아티클"}
                <span style={{ marginLeft: 5, fontSize: 12, opacity: 0.5, fontWeight: 400 }}>
                  {t === "cards" ? cardsets.length : articles.length}
                </span>
              </button>
            ))}
          </div>

          {/* ── 카드 그리드 ── */}
          {tab === "cards" && (
            cardsets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 15, color: "#bbb", marginBottom: 20 }}>저장된 카드가 없습니다</div>
                <Link href="/create" style={{
                  background: "#1E2E24", color: "#fff", padding: "10px 24px",
                  borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>첫 카드 만들기</Link>
              </div>
            ) : (
              <div className="hc-grid">
                {cardsets.map((cs) => (
                  <div key={cs.id} className="hc-card" style={{
                    opacity: deletingCard === cs.id ? 0.4 : 1, transition: "opacity 0.2s",
                  }}>
                    {/* 썸네일 */}
                    <div className="hc-card-img">
                      {cs.card_urls?.[0] && (
                        <Image
                          src={cs.card_urls[0]} alt={cs.title} fill
                          sizes="(max-width: 480px) 50vw, (max-width: 860px) 50vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>

                    {/* 메타 */}
                    <div className="hc-card-date">
                      {cs.date}{cs.series && ` · ${cs.series}`}
                    </div>
                    <div className="hc-card-title">{cs.title}</div>

                    {/* 액션 버튼 */}
                    <div className="hc-card-actions">
                      {cs.youtube_url && (
                        <a
                          href={cs.youtube_url} target="_blank" rel="noopener noreferrer"
                          className="hc-act-btn" style={{ textDecoration: "none" }}
                        >설교</a>
                      )}
                      <button className="hc-act-btn" onClick={() => copyCardLink(cs)}>링크</button>
                      <button className="hc-act-btn" onClick={() => downloadCard(cs)}>다운</button>
                      <button
                        className="hc-act-btn hc-act-btn--danger"
                        onClick={() => setDeleteCardTarget(cs)}
                      >삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── 아티클 리스트 ── */}
          {tab === "articles" && (
            articles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 15, color: "#bbb", marginBottom: 20 }}>작성된 아티클이 없습니다</div>
                <Link href="/article-editor" style={{
                  background: "#1E2E24", color: "#fff", padding: "10px 24px",
                  borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>아티클 작성</Link>
              </div>
            ) : (
              <div>
                {articles.map((article) => (
                  <div key={article.id} className="hc-art-row" style={{
                    opacity: deletingArticle === article.id ? 0.4 : 1, transition: "opacity 0.2s",
                  }}>
                    <Link href={`/articles/${article.slug || article.id}`} className="hc-art-link">
                      <div className="hc-art-date">
                        {article.date}{article.series && ` · ${article.series}`}
                      </div>
                      <div className="hc-art-title">{article.title}</div>
                      {article.scripture && (
                        <div className="hc-art-scripture">{article.scripture}</div>
                      )}
                    </Link>
                    <div style={{ display: "flex", gap: 6, paddingLeft: 16, flexShrink: 0 }}>
                      <button
                        onClick={() => copyArticleLink(article)}
                        style={{
                          background: "none", border: "1px solid #e8e8e8",
                          borderRadius: 6, padding: "5px 10px", fontSize: 11,
                          cursor: "pointer", color: "#aaa",
                        }}
                      >링크</button>
                      <button
                        onClick={() => setDeleteArticleTarget(article)}
                        style={{
                          background: "none", border: "none",
                          fontSize: 11, cursor: "pointer", color: "#e05252", padding: "5px 6px",
                        }}
                      >삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <footer style={{
          borderTop: "1px solid #f0f0f0", padding: "20px 24px",
          textAlign: "center", fontSize: 12, color: "#ccc",
        }}>
          나무카드 · 나무십자가교회 · made by tomob
        </footer>
      </div>

      <ConfirmModal
        open={!!deleteCardTarget} title="카드 삭제"
        message={`"${deleteCardTarget?.title}" 카드를 삭제하시겠습니까?`}
        confirmLabel="삭제" danger
        onConfirm={confirmDeleteCard} onCancel={() => setDeleteCardTarget(null)}
      />
      <ConfirmModal
        open={!!deleteArticleTarget} title="아티클 삭제"
        message={`"${deleteArticleTarget?.title}" 아티클을 삭제하시겠습니까?`}
        confirmLabel="삭제" danger
        onConfirm={confirmDeleteArticle} onCancel={() => setDeleteArticleTarget(null)}
      />
    </>
  );
}
