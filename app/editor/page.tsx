"use client";

import { useEditorStore, CardData } from "@/lib/store";
import CardPreview from "@/components/CardPreview";
import PageHeader from "@/components/PageHeader";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const {
    format, cards, currentCard, youtubeUrl, templateColor, templateIsLight,
    updateCard, addCard, removeCard, setCurrentCard, setYoutubeUrl,
  } = useEditorStore();

  const router = useRouter();
  const safeIndex = currentCard >= cards.length ? 0 : currentCard;
  const card = cards[safeIndex];
  const coverCard = cards[0];

  function handleMake() {
    router.push("/done");
  }

  return (
    <div className="editor-shell">
      <PageHeader title="에디터" />

      <div className="editor-grid">
        {/* 좌: 입력 패널 */}
        <div className="editor-panel">

          {/* 카드 탭 */}
          <div>
            <div className="label-sm" style={{ marginBottom: 10 }}>카드 선택</div>
            <div className="card-tabs">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentCard(i)}
                  className="btn"
                  style={{
                    padding: "6px 14px",
                    fontSize: 13,
                    background: currentCard === i ? "#1E1E1C" : "transparent",
                    color: currentCard === i ? "#fff" : "#1E1E1C",
                    border: currentCard === i ? "none" : "1px solid rgba(0,0,0,0.15)",
                  }}
                >
                  {i === 0 ? "표지" : `${i}번`}
                </button>
              ))}
              {cards.length < 5 && (
                <button onClick={addCard} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
                  + 추가
                </button>
              )}
              {cards.length > 2 && currentCard > 0 && (
                <button
                  onClick={() => removeCard(card.id)}
                  style={{ background: "none", border: "none", color: "#e05252", fontSize: 13, cursor: "pointer", padding: "6px 8px" }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          {/* 표지 카드 필드 */}
          {card.type === "cover" ? (
            <CoverFields card={card} update={(d) => updateCard(card.id, d)} />
          ) : (
            <BodyFields card={card} format={format} update={(d) => updateCard(card.id, d)} />
          )}

          {/* 유튜브 링크 */}
          <div>
            <label className="label-sm" style={{ marginBottom: 8 }}>
              유튜브 링크 (선택 — 설교 영상 연결)
            </label>
            <input
              className="input"
              placeholder="https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          {/* 만들기 버튼 */}
          <button onClick={handleMake} className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}>
            카드 만들기 →
          </button>
        </div>

        {/* 우: 미리보기 패널 */}
        <div className="editor-preview">
          {/* 카드 인디케이터 */}
          <div className="card-indicator">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCard(i)}
                className="card-dot"
                style={{
                  width: currentCard === i ? 20 : 8,
                  background: currentCard === i ? "var(--primary)" : "rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </div>

          {/* 실시간 카드 렌더 */}
          <div style={{
            width: 540,
            height: format === "story" ? 960 : 540,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            flexShrink: 0,
          }}>
            <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: 1080, height: format === "story" ? 1920 : 1080 }}>
              <CardPreview
                card={card}
                templateColor={templateColor}
                templateIsLight={templateIsLight}
                format={format}
                cardIndex={currentCard}
                totalCards={cards.length}
                seriesName={coverCard.series}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverFields({ card, update }: { card: CardData; update: (d: Partial<CardData>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="날짜" placeholder="2026년 3월 15일" value={card.date ?? ""} onChange={(v) => update({ date: v })} />
      <Field label="설교 제목 *" placeholder="제목을 입력하세요" value={card.title ?? ""} onChange={(v) => update({ title: v })} />
      <Field label="강해 시리즈" placeholder="예) 로마서 강해" value={card.series ?? ""} onChange={(v) => update({ series: v })} />
      <Field label="본문" placeholder="예) 롬 8:1-4" value={card.scripture ?? ""} onChange={(v) => update({ scripture: v })} />
    </div>
  );
}

function BodyFields({ card, format, update }: { card: CardData; format: "feed" | "story"; update: (d: Partial<CardData>) => void }) {
  const maxChars = format === "story" ? 600 : 378;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="소제목" placeholder="이 카드의 핵심 포인트" value={card.subtitle ?? ""} onChange={(v) => update({ subtitle: v })} />
      <TextareaField
        label="본문 내용 *"
        placeholder="말씀 요약 또는 핵심 내용을 입력하세요"
        value={card.content ?? ""}
        onChange={(v) => update({ content: v })}
        maxChars={maxChars}
      />
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange, maxChars }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; maxChars?: number }) {
  const len = value.length;
  const remaining = maxChars ? maxChars - len : null;
  const isWarn = remaining !== null && remaining <= 30;
  const isOver = remaining !== null && remaining < 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label className="label-sm" style={{ marginBottom: 0 }}>{label}</label>
        {maxChars && (
          <span style={{ fontSize: 11, color: isOver ? "#e05252" : isWarn ? "#C4873A" : "#BBBBBB" }}>
            {len} / {maxChars}
          </span>
        )}
      </div>
      <textarea
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        style={{ resize: "vertical", borderColor: isOver ? "#e05252" : undefined }}
      />
      {isOver && (
        <p className="error-text" style={{ marginTop: 4 }}>
          카드에서 내용이 잘릴 수 있습니다 ({Math.abs(remaining!)}자 초과)
        </p>
      )}
    </div>
  );
}
