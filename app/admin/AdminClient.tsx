"use client";

import { useState } from "react";
import { Template, supabase } from "@/lib/supabase";

type Props = { initialTemplates: Template[] };

export default function AdminClient({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [newName, setNewName] = useState("");
  const [newFormat, setNewFormat] = useState<"feed" | "story">("feed");
  const [newBgColor, setNewBgColor] = useState("#2D5A3D");
  const [saving, setSaving] = useState(false);

  async function addTemplate() {
    if (!newName.trim()) return;
    setSaving(true);
    const { data } = await supabase.from("templates").insert({
      name: newName,
      format: newFormat,
      bg_color: newBgColor,
      text_color: "#FFFFFF",
      active: true,
    }).select().single();
    if (data) setTemplates((prev) => [...prev, data as Template]);
    setNewName("");
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("templates").update({ active: !current }).eq("id", id);
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, active: !current } : t));
  }

  async function deleteTemplate(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 새 템플릿 추가 */}
      <div className="card-box">
        <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>새 템플릿 추가</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#7A7A72", display: "block", marginBottom: 6 }}>이름</label>
            <input className="input" placeholder="템플릿 이름" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#7A7A72", display: "block", marginBottom: 6 }}>포맷</label>
            <select className="input" value={newFormat} onChange={(e) => setNewFormat(e.target.value as "feed" | "story")}>
              <option value="feed">피드</option>
              <option value="story">스토리</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#7A7A72", display: "block", marginBottom: 6 }}>배경색</label>
            <input type="color" className="input" value={newBgColor} onChange={(e) => setNewBgColor(e.target.value)} style={{ padding: 4, height: 40 }} />
          </div>
          <button onClick={addTemplate} className="btn btn-primary" disabled={saving} style={{ height: 40 }}>
            추가
          </button>
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {templates.length === 0 && (
          <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#7A7A72", textAlign: "center", padding: "40px 0" }}>
            등록된 템플릿이 없습니다
          </p>
        )}
        {templates.map((t) => (
          <div key={t.id} className="card-box" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: t.bg_color ?? "#2D5A3D", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 14, fontWeight: 700, color: "#1E1E1C" }}>{t.name}</div>
              <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#7A7A72" }}>{t.format === "feed" ? "피드 1:1" : "스토리 9:16"}</div>
            </div>
            <span className={`badge ${t.active ? "badge-primary" : ""}`} style={!t.active ? { background: "#f0f0f0", color: "#999" } : {}}>
              {t.active ? "활성" : "비활성"}
            </span>
            <button onClick={() => toggleActive(t.id, t.active)} className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
              {t.active ? "비활성화" : "활성화"}
            </button>
            <button onClick={() => deleteTemplate(t.id)} style={{ background: "none", border: "none", color: "#e05252", cursor: "pointer", fontSize: 13, padding: "5px 8px" }}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
