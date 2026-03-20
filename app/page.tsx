"use client";

import { useState } from "react";
import Link from "next/link";
import { useEditorStore } from "@/lib/store";
import { TEMPLATES } from "@/components/CardPreview";
import PageHeader from "@/components/PageHeader";

export default function HomePage() {
  const { format, setFormat, templateId, setTemplate } = useEditorStore();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter((t) => t.format === format);
  const selected = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  function handleSelectTemplate(t: (typeof TEMPLATES)[0]) {
    setTemplate(t.id, t.bgColor, t.isLight);
  }

  return (
    <div className="page-shell">
      <PageHeader />

      <main className="page-main page-main--wide">
        <div style={{ marginBottom: 40 }}>
          <h1 className="heading-xl">포맷을 선택하세요</h1>
          <p className="sub-text" style={{ fontSize: 15 }}>
            템플릿을 고른 후 만들기를 시작합니다
          </p>
        </div>

        {/* 포맷 탭 */}
        <div className="format-tabs">
          {(["feed", "story"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFormat(f);
                const first = TEMPLATES.find((t) => t.format === f);
                if (first) setTemplate(first.id, first.bgColor, first.isLight);
              }}
              className="btn"
              style={{
                background: format === f ? "#1E1E1C" : "transparent",
                color: format === f ? "#fff" : "#1E1E1C",
                border: format === f ? "none" : "1px solid rgba(0,0,0,0.15)",
                padding: "8px 20px",
                fontSize: 14,
              }}
            >
              {f === "feed" ? "피드 4:5" : "스토리 9:16"}
            </button>
          ))}
        </div>

        <div className="home-layout">
          {/* 왼쪽: 템플릿 그리드 */}
          <div>
            <div className="label-sm" style={{ marginBottom: 14, letterSpacing: "0.05em" }}>템플릿 선택</div>
            <div className="template-grid">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  onMouseEnter={() => setHoveredTemplate(t.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className="template-btn"
                >
                  <div
                    className={`template-thumb${templateId === t.id ? " template-thumb--selected" : ""}`}
                    style={{
                      background: t.bgColor,
                      border: templateId === t.id ? undefined : "2px solid transparent",
                      transform: hoveredTemplate === t.id ? "scale(1.03)" : undefined,
                    }}
                  >
                    <span style={{ fontFamily: "var(--f-head)", fontSize: 10, fontWeight: 700, color: t.textColor, opacity: 0.7 }}>나무카드.</span>
                  </div>
                  <div className={`template-name${templateId === t.id ? " template-name--selected" : ""}`}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 미리보기 + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="label-sm" style={{ marginBottom: 14, letterSpacing: "0.05em" }}>미리보기</div>
              <div style={{
                width: "100%",
                aspectRatio: format === "story" ? "9/16" : "4/5",
                borderRadius: 12,
                background: selected?.bgColor ?? "#2D5A3D",
                display: "flex",
                flexDirection: "column",
                padding: "24px 20px",
                justifyContent: "space-between",
              }}>
                <div style={{ fontSize: 10, fontFamily: "var(--f-body)", color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em" }}>SERIES NAME</div>
                <div style={{ fontFamily: "var(--f-head)", fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                  설교 제목이<br />여기에 표시됩니다
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="play-circle" style={{ width: 20, height: 20 }}>
                      <div className="play-triangle" style={{ borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 5 }} />
                    </div>
                    <span style={{ fontFamily: "var(--f-head)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>나무카드.</span>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>1 / 3</span>
                </div>
              </div>
            </div>
            <Link href="/editor" className="btn btn-primary btn-lg" style={{ justifyContent: "center", textAlign: "center" }}>
              만들기 시작하기 →
            </Link>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <p>나무카드 · 나무십자가교회 · made by tomob</p>
      </footer>
    </div>
  );
}
