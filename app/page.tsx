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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader />

      <main style={{ flex: 1, maxWidth: 960, margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 28, fontWeight: 700, color: "#1E1E1C", marginBottom: 8 }}>
            포맷을 선택하세요
          </h1>
          <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 15, color: "#7A7A72" }}>
            템플릿을 고른 후 만들기를 시작합니다
          </p>
        </div>

        {/* 포맷 탭 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
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
              {f === "feed" ? "피드 1:1" : "스토리 9:16"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32 }}>
          {/* 왼쪽: 템플릿 그리드 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#7A7A72", marginBottom: 14, letterSpacing: "0.05em" }}>템플릿 선택</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  onMouseEnter={() => setHoveredTemplate(t.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                >
                  <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 10,
                    background: t.bgColor,
                    border: templateId === t.id ? "3px solid #3D6B4F" : "2px solid transparent",
                    marginBottom: 8,
                    transition: "transform 0.15s",
                    transform: hoveredTemplate === t.id ? "scale(1.03)" : "scale(1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 10, fontWeight: 700, color: t.textColor, opacity: 0.7 }}>나무카드.</span>
                  </div>
                  <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#1E1E1C", fontWeight: templateId === t.id ? 600 : 400 }}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 미리보기 + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#7A7A72", marginBottom: 14, letterSpacing: "0.05em" }}>미리보기</div>
              <div style={{
                width: "100%",
                aspectRatio: format === "story" ? "9/16" : "1/1",
                borderRadius: 12,
                background: selected?.bgColor ?? "#2D5A3D",
                display: "flex",
                flexDirection: "column",
                padding: "24px 20px",
                justifyContent: "space-between",
              }}>
                <div style={{ fontSize: 10, fontFamily: '"Suit", sans-serif', color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em" }}>SERIES NAME</div>
                <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                  설교 제목이<br />여기에 표시됩니다
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "5px solid rgba(255,255,255,0.8)", marginLeft: 1 }} />
                    </div>
                    <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>나무카드.</span>
                  </div>
                  <span style={{ fontFamily: '"Suit", sans-serif', fontSize: 10, color: "rgba(255,255,255,0.5)" }}>1 / 3</span>
                </div>
              </div>
            </div>
            <Link href="/editor" className="btn btn-primary btn-lg" style={{ justifyContent: "center", textAlign: "center" }}>
              만들기 시작하기 →
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#aaa" }}>나무카드 · 나무십자가교회 · made by tomob</p>
      </footer>
    </div>
  );
}
