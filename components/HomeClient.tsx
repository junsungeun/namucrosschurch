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
    const a = document.createElement("a"); a.href = url;
    a.download = `나무카드_${cs.date}.zip`; a.click();
  }

  function copyCardLink(cs: CardSet) {
    setOpenMenu(null);
    navigator.clipboard.writeText(`${window.location.origin}/article/${cs.slug || cs.id}`);
    toast("링크가 복사되었습니다!", "success");
  }

  function copyArticleLink(article: Article) {
    setOpenMenu(null);
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

        {/* 콘텐츠 */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>

          {/* 탭 */}
          <div style={{ display: "flex", borderBottom: "1px solid #eee", marginTop: 32, marginBottom: 8 }}>
            {(["cards", "articles"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "12px 0", marginRight: 28, fontSize: 14,
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? "#111" : "#bbb",
                borderBottom: tab === t ? "2px solid #111" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}>
                {t === "cards" ? "카드뉴스" : "아티클"}
                <span style={{ marginLeft: 5, fontSize: 12, opacity: 0.5, fontWeight: 400 }}>
                  {t === "cards" ? cardsets.length : articles.length}
                </span>
              </button>
            ))}
          </div>

          {/* ── 카드뉴스 목록 ── */}
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                {cardsets.map((cs) => (
                  <div key={cs.id} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 0", borderBottom: "1px solid #f3f3f3",
                    opacity: deletingCard === cs.id ? 0.4 : 1, transition: "opacity 0.2s",
                    position: "relative",
                  }}>
                    {/* 썸네일 */}
                    <div style={{
                      width: 60, height: 60, borderRadius: 8, overflow: "hidden",
                      background: "#2D5A3D", flexShrink: 0, position: "relative",
                    }}>
                      {cs.card_urls?.[0] && (
                        <Image
                          src={cs.card_urls[0]} alt={cs.title} fill
                          sizes="60px" style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>

                    {/* 텍스트 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--f-head)", fontSize: 15, fontWeight: 700,
                        color: "#111", marginBottom: 4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{cs.title}</div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>
                        {cs.date}{cs.series && ` · ${cs.series}`}
                        {cs.scripture && ` · ${cs.scripture}`}
                      </div>
                    </div>

                    {/* 드롭다운 */}
                    <div className="dropdown" ref={openMenu === cs.id ? menuRef : undefined}>
                      <button
                        className="dropdown-trigger"
                        onClick={() => setOpenMenu(openMenu === cs.id ? null : cs.id)}
                      >⋯</button>
                      {openMenu === cs.id && (
                        <div className="dropdown-menu">
                          {cs.youtube_url && (
                            <a href={cs.youtube_url} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                              설교 영상 보기
                            </a>
                          )}
                          <button className="dropdown-item" onClick={() => copyCardLink(cs)}>
                            아티클 링크 복사
                          </button>
                          <button className="dropdown-item" onClick={() => downloadCard(cs)}>
                            카드 다운로드
                          </button>
                          <div className="dropdown-divider" />
                          <button
                            className="dropdown-item dropdown-item--danger"
                            onClick={() => { setOpenMenu(null); setDeleteCardTarget(cs); }}
                          >삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── 아티클 목록 ── */}
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                {articles.map((article) => (
                  <div key={article.id} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 0", borderBottom: "1px solid #f3f3f3",
                    opacity: deletingArticle === article.id ? 0.4 : 1, transition: "opacity 0.2s",
                    position: "relative",
                  }}>
                    {/* 텍스트 — 클릭 시 상세 이동 */}
                    <Link href={`/articles/${article.slug || article.id}`} style={{
                      flex: 1, minWidth: 0, textDecoration: "none",
                    }}>
                      <div style={{
                        fontFamily: "var(--f-head)", fontSize: 15, fontWeight: 700,
                        color: "#111", marginBottom: 4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{article.title}</div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>
                        {article.date}
                        {article.series && ` · ${article.series}`}
                        {article.scripture && ` · ${article.scripture}`}
                      </div>
                    </Link>

                    {/* 드롭다운 */}
                    <div className="dropdown" ref={openMenu === article.id ? menuRef : undefined}>
                      <button
                        className="dropdown-trigger"
                        onClick={() => setOpenMenu(openMenu === article.id ? null : article.id)}
                      >⋯</button>
                      {openMenu === article.id && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => copyArticleLink(article)}>
                            아티클 링크 복사
                          </button>
                          <div className="dropdown-divider" />
                          <button
                            className="dropdown-item dropdown-item--danger"
                            onClick={() => { setOpenMenu(null); setDeleteArticleTarget(article); }}
                          >삭제</button>
                        </div>
                      )}
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
