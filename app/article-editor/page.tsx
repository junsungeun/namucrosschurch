"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import RichTextEditor from "@/components/RichTextEditor";

type Form = {
  title: string;
  date: string;
  series: string;
  scripture: string;
  body: string;
  god_father: string;
  god_son: string;
  god_spirit: string;
  youtube_url: string;
};

const EMPTY: Form = {
  title: "", date: "", series: "", scripture: "",
  body: "", god_father: "", god_son: "", god_spirit: "", youtube_url: "",
};

export default function ArticleEditorPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isValid = !!(form.title.trim() && form.date.trim() && form.scripture.trim());

  useEffect(() => {
    const hasContent = Object.values(form).some((v) => v.trim());
    if (!hasContent) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) { e.preventDefault(); }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  function set(key: keyof Form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/save-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "저장 실패");
        return;
      }
      const { slug, id } = await res.json();
      router.push(`/articles/${slug || id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="아티클 작성" />
      <main className="page-main" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-lg">아티클 작성</h1>
          <p className="sub-text">설교 본문과 말씀 묵상을 기록합니다</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 기본 정보 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="label-sm">날짜 <span className="required-mark">*</span></label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div>
              <label className="label-sm">강해 시리즈</label>
              <input
                className="input"
                placeholder="예) 로마서 강해"
                value={form.series}
                onChange={(e) => set("series", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-sm">설교 제목 <span className="required-mark">*</span></label>
            <input
              className="input"
              placeholder="제목을 입력하세요"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className="label-sm">성경 본문 <span className="required-mark">*</span></label>
            <input
              className="input"
              placeholder="예) 롬 8:1-4"
              value={form.scripture}
              onChange={(e) => set("scripture", e.target.value)}
            />
          </div>

          {/* 본문 */}
          <div className="card-box" style={{ padding: 20 }}>
            <RichTextEditor
              key="body"
              label="설교 본문"
              value={form.body}
              onChange={(v) => set("body", v)}
              placeholder="설교 내용을 입력하세요"
            />
          </div>

          {/* 유튜브 */}
          <div>
            <label className="label-sm">유튜브 링크 (선택 — 설교 영상 연결)</label>
            <input
              className="input"
              placeholder="https://youtu.be/..."
              value={form.youtube_url}
              onChange={(e) => set("youtube_url", e.target.value)}
            />
          </div>

          {/* 말씀 묵상 섹션 */}
          <div style={{ borderTop: "2px solid var(--border)", paddingTop: 24 }}>
            <div style={{ fontFamily: "var(--f-head)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 6 }}>
              말씀 묵상
            </div>
            <p className="sub-text" style={{ marginBottom: 20, fontSize: 13 }}>
              본문에서 하나님·예수님·성령님을 각각 찾아 정리합니다
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card-box" style={{ padding: 20, borderLeft: "3px solid #3D6B4F" }}>
                <RichTextEditor
                  key="god_father"
                  label="하나님 찾기"
                  value={form.god_father}
                  onChange={(v) => set("god_father", v)}
                  placeholder="이 본문에서 하나님은 어떤 분이신가요?"
                />
              </div>

              <div className="card-box" style={{ padding: 20, borderLeft: "3px solid #5EA0DC" }}>
                <RichTextEditor
                  key="god_son"
                  label="예수님 찾기"
                  value={form.god_son}
                  onChange={(v) => set("god_son", v)}
                  placeholder="이 본문에서 예수님은 무엇을 하셨나요?"
                />
              </div>

              <div className="card-box" style={{ padding: 20, borderLeft: "3px solid #C4873A" }}>
                <RichTextEditor
                  key="god_spirit"
                  label="성령님 찾기"
                  value={form.god_spirit}
                  onChange={(v) => set("god_spirit", v)}
                  placeholder="이 본문에서 성령님은 무엇을 원하시나요?"
                />
              </div>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            onClick={handleSave}
            className="btn btn-primary btn-lg"
            style={{ justifyContent: "center" }}
            disabled={!isValid || saving}
          >
            {saving ? "저장 중..." : "아티클 저장하기 →"}
          </button>
        </div>
      </main>
      <footer className="page-footer"><p>나무카드 · 나무십자가교회 · made by tomob</p></footer>
    </div>
  );
}
