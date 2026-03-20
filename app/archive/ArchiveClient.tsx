"use client";

import { useState, useRef, useEffect } from "react";
import { CardSet } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

type Props = { grouped: Record<string, CardSet[]> };

export default function ArchiveClient({ grouped }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CardSet>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CardSet | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  async function redownload(cs: CardSet) {
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
    a.href = url;
    a.download = `나무카드_${cs.date}.zip`;
    a.click();
  }

  function copyArticleLink(cs: CardSet) {
    setOpenMenu(null);
    const key = cs.slug || cs.id;
    navigator.clipboard.writeText(`${window.location.origin}/article/${key}`);
    toast("링크가 복사되었습니다!", "success");
  }

  function startEdit(cs: CardSet) {
    setOpenMenu(null);
    setEditing(cs.id);
    setEditForm({
      title: cs.title, series: cs.series ?? "", scripture: cs.scripture ?? "",
      summary: cs.summary ?? "", youtube_url: cs.youtube_url ?? "", date: cs.date,
    });
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/update-cardset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (!res.ok) { const d = await res.json(); toast(`수정 실패: ${d.error}`, "error"); return; }
      setEditing(null);
      toast("수정 완료", "success");
      router.refresh();
    } catch (e) { toast(`수정 오류: ${e}`, "error"); }
    finally { setSaving(false); }
  }

  function requestDelete(cs: CardSet) {
    setOpenMenu(null);
    setDeleteTarget(cs);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    setDeleteTarget(null);
    try {
      const res = await fetch("/api/delete-cardset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id, card_urls: deleteTarget.card_urls }),
      });
      if (!res.ok) { const d = await res.json(); toast(`삭제 실패: ${d.error}`, "error"); return; }
      toast("삭제 완료", "success");
      router.refresh();
    } catch (e) { toast(`삭제 오류: ${e}`, "error"); }
    finally { setDeleting(null); }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <div style={{ fontFamily: "var(--f-head)", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              {month}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((cs) => (
                <div key={cs.id}>
                  <div className="card-box" style={{ display: "flex", gap: 16, alignItems: "center", opacity: deleting === cs.id ? 0.4 : 1, transition: "opacity 0.2s" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "#2D5A3D", flexShrink: 0 }}>
                      {cs.card_urls?.[0] ? (
                        <Image src={cs.card_urls[0]} alt={cs.title} width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "var(--f-head)", fontSize: 9, color: "rgba(255,255,255,0.7)" }}>나무카드.</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--f-head)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cs.title}
                      </div>
                      <div className="sub-text" style={{ fontSize: 12 }}>
                        {cs.date} · {cs.series ?? ""} {cs.scripture ? `· ${cs.scripture}` : ""}
                      </div>
                    </div>

                    {/* 드롭다운 */}
                    <div className="dropdown" ref={openMenu === cs.id ? menuRef : undefined}>
                      <button className="dropdown-trigger" onClick={() => setOpenMenu(openMenu === cs.id ? null : cs.id)}>⋯</button>
                      {openMenu === cs.id && (
                        <div className="dropdown-menu">
                          {cs.youtube_url && <a href={cs.youtube_url} target="_blank" rel="noopener noreferrer" className="dropdown-item">설교보기</a>}
                          <button className="dropdown-item" onClick={() => redownload(cs)}>다운로드</button>
                          <button className="dropdown-item" onClick={() => copyArticleLink(cs)}>아티클 링크</button>
                          <button className="dropdown-item" onClick={() => startEdit(cs)}>수정</button>
                          <div className="dropdown-divider" />
                          <button className="dropdown-item dropdown-item--danger" onClick={() => requestDelete(cs)}>삭제</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editing === cs.id && (
                    <div className="inline-form">
                      <div>
                        <label className="label-sm">제목</label>
                        <input className="input" value={editForm.title ?? ""} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">날짜</label>
                        <input className="input" type="date" value={editForm.date ?? ""} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">시리즈</label>
                        <input className="input" value={editForm.series ?? ""} onChange={e => setEditForm(f => ({ ...f, series: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">성경구절</label>
                        <input className="input" value={editForm.scripture ?? ""} onChange={e => setEditForm(f => ({ ...f, scripture: e.target.value }))} />
                      </div>
                      <div className="inline-form--full">
                        <label className="label-sm">본문 내용</label>
                        <textarea className="input" rows={10} style={{ resize: "vertical", whiteSpace: "pre-wrap" }} value={editForm.summary ?? ""} onChange={e => setEditForm(f => ({ ...f, summary: e.target.value }))} />
                      </div>
                      <div className="inline-form--full">
                        <label className="label-sm">유튜브 URL</label>
                        <input className="input" value={editForm.youtube_url ?? ""} onChange={e => setEditForm(f => ({ ...f, youtube_url: e.target.value }))} />
                      </div>
                      <div className="inline-form-actions">
                        <button onClick={() => setEditing(null)} className="btn btn-secondary" style={{ padding: "6px 16px", fontSize: 12 }}>취소</button>
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

      <ConfirmModal
        open={!!deleteTarget}
        title="카드 삭제"
        message={`"${deleteTarget?.title}" 카드를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
