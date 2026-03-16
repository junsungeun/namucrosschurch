"use client";

import { useState } from "react";
import { CardSet } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = { grouped: Record<string, CardSet[]> };

export default function ArchiveClient({ grouped }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CardSet>>({});
  const [saving, setSaving] = useState(false);

  async function redownload(cs: CardSet) {
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
    a.href = url;
    a.download = `나무카드_${cs.date}.zip`;
    a.click();
  }

  function copyArticleLink(id: string) {
    const url = `${window.location.origin}/article/${id}`;
    navigator.clipboard.writeText(url);
    alert("링크가 복사되었습니다!");
  }

  async function handleDelete(cs: CardSet) {
    if (!confirm(`"${cs.title}" 카드를 삭제하시겠습니까?`)) return;
    setDeleting(cs.id);
    try {
      const res = await fetch("/api/delete-cardset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cs.id, card_urls: cs.card_urls }),
      });
      const data = await res.json();
      if (!res.ok) { alert(`삭제 실패: ${data.error}`); return; }
      router.refresh();
    } catch (e) {
      alert(`삭제 오류: ${e}`);
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(cs: CardSet) {
    setEditing(cs.id);
    setEditForm({ title: cs.title, series: cs.series ?? "", scripture: cs.scripture ?? "", summary: cs.summary ?? "", youtube_url: cs.youtube_url ?? "", date: cs.date });
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/update-cardset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) { alert(`수정 실패: ${data.error}`); return; }
      setEditing(null);
      router.refresh();
    } catch (e) {
      alert(`수정 오류: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    fontFamily: '"Suit", sans-serif', fontSize: 13, padding: "6px 10px",
    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6, width: "100%",
    outline: "none", color: "#1E1E1C",
  } as const;

  const labelStyle = {
    fontFamily: '"Suit", sans-serif', fontSize: 11, color: "#7A7A72",
    marginBottom: 2, display: "block",
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <div style={{
            fontFamily: '"GMarketSans", sans-serif',
            fontSize: 13, fontWeight: 700,
            color: "#7A7A72",
            letterSpacing: "0.05em",
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}>
            {month}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((cs) => (
              <div key={cs.id}>
                <div className="card-box" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {/* 썸네일 */}
                  <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "#2D5A3D", flexShrink: 0 }}>
                    {cs.card_urls?.[0] ? (
                      <Image src={cs.card_urls[0]} alt="" width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 9, color: "rgba(255,255,255,0.7)" }}>나무카드.</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 15, fontWeight: 700, color: "#1E1E1C", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cs.title}
                    </div>
                    <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#7A7A72" }}>
                      {cs.date} · {cs.series ?? ""} {cs.scripture ? `· ${cs.scripture}` : ""}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {cs.youtube_url && (
                      <a href={cs.youtube_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                        ▶ 설교
                      </a>
                    )}
                    <button onClick={() => redownload(cs)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                      ↓ 다운로드
                    </button>
                    <button onClick={() => copyArticleLink(cs.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                      🔗 아티클
                    </button>
                    <button onClick={() => startEdit(cs)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                      ✏️ 수정
                    </button>
                    <button
                      onClick={() => handleDelete(cs)}
                      disabled={deleting === cs.id}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 12, color: "#e53e3e" }}
                    >
                      {deleting === cs.id ? "삭제 중..." : "🗑 삭제"}
                    </button>
                  </div>
                </div>

                {/* 수정 폼 */}
                {editing === cs.id && (
                  <div style={{
                    marginTop: 8, padding: 16, background: "#FAFAF8",
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10,
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                  }}>
                    <div>
                      <label style={labelStyle}>제목</label>
                      <input style={inputStyle} value={editForm.title ?? ""} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>날짜</label>
                      <input style={inputStyle} type="date" value={editForm.date ?? ""} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>시리즈</label>
                      <input style={inputStyle} value={editForm.series ?? ""} onChange={e => setEditForm(f => ({ ...f, series: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>성경구절</label>
                      <input style={inputStyle} value={editForm.scripture ?? ""} onChange={e => setEditForm(f => ({ ...f, scripture: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>요약</label>
                      <input style={inputStyle} value={editForm.summary ?? ""} onChange={e => setEditForm(f => ({ ...f, summary: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>유튜브 URL</label>
                      <input style={inputStyle} value={editForm.youtube_url ?? ""} onChange={e => setEditForm(f => ({ ...f, youtube_url: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setEditing(null)} className="btn btn-secondary" style={{ padding: "6px 16px", fontSize: 12 }}>
                        취소
                      </button>
                      <button onClick={() => handleUpdate(cs.id)} disabled={saving} className="btn btn-primary" style={{ padding: "6px 16px", fontSize: 12 }}>
                        {saving ? "저장 중..." : "저장"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
