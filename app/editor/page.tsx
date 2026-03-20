"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorStore, CardData } from "@/lib/store";
import CardPreview from "@/components/CardPreview";
import PageHeader from "@/components/PageHeader";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mark, mergeAttributes } from "@tiptap/core";

export default function EditorPage() {
  const {
    format, cards, currentCard, youtubeUrl, templateColor, templateIsLight,
    updateCard, addCard, removeCard, setCurrentCard, setYoutubeUrl,
  } = useEditorStore();

  const router = useRouter();
  const safeIndex = currentCard >= cards.length ? 0 : currentCard;
  const card = cards[safeIndex];
  const coverCard = cards[0];
  const [mobileTab, setMobileTab] = useState<"input" | "preview">("input");

  // 필수 입력 검증
  const isValid = cards.every(c =>
    c.type === "cover" ? !!(c.title && c.title.trim()) : !!(c.content && c.content.trim())
  );

  // 이탈 경고
  useEffect(() => {
    const hasContent = cards.some(c =>
      (c.title && c.title.trim()) || (c.content && c.content.trim()) || (c.subtitle && c.subtitle.trim())
    );
    if (!hasContent) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) { e.preventDefault(); }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cards]);

  function handleMake() {
    router.push("/done");
  }

  return (
    <div className="editor-shell">
      <PageHeader title="에디터" />

      {/* 모바일 탭 토글 */}
      <div className="editor-mobile-tabs">
        <button className={`editor-mobile-tab${mobileTab === "input" ? " editor-mobile-tab--active" : ""}`} onClick={() => setMobileTab("input")}>입력</button>
        <button className={`editor-mobile-tab${mobileTab === "preview" ? " editor-mobile-tab--active" : ""}`} onClick={() => setMobileTab("preview")}>미리보기</button>
      </div>

      <div className="editor-grid">
        {/* 좌: 입력 패널 */}
        <div className={`editor-panel${mobileTab !== "input" ? " editor-panel--hidden" : ""}`}>

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
              {cards.length < 20 && (
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
            <BodyFields key={card.id} card={card} format={format} update={(d) => updateCard(card.id, d)} />
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
          <button onClick={handleMake} className="btn btn-primary btn-lg" style={{ justifyContent: "center" }} disabled={!isValid}>
            카드 만들기 →
          </button>
        </div>

        {/* 우: 미리보기 패널 */}
        <div className={`editor-preview${mobileTab !== "preview" ? " editor-panel--hidden" : ""}`}>
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
          <EditorPreviewCard
            card={card}
            format={format}
            templateColor={templateColor}
            templateIsLight={templateIsLight}
            cardIndex={currentCard}
            totalCards={cards.length}
            seriesName={coverCard.series}
          />
        </div>
      </div>
    </div>
  );
}

function CoverFields({ card, update }: { card: CardData; update: (d: Partial<CardData>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="날짜" placeholder="2026년 3월 15일" value={card.date ?? ""} onChange={(v) => update({ date: v })} />
      <Field label="설교 제목" placeholder="제목을 입력하세요" value={card.title ?? ""} onChange={(v) => update({ title: v })} required />
      <Field label="강해 시리즈" placeholder="예) 로마서 강해" value={card.series ?? ""} onChange={(v) => update({ series: v })} />
      <Field label="본문" placeholder="예) 롬 8:1-4" value={card.scripture ?? ""} onChange={(v) => update({ scripture: v })} />
    </div>
  );
}

function BodyFields({ card, format, update }: { card: CardData; format: "feed" | "story"; update: (d: Partial<CardData>) => void }) {
  const maxChars = format === "story" ? 700 : 500;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="소제목" placeholder="이 카드의 핵심 포인트" value={card.subtitle ?? ""} onChange={(v) => update({ subtitle: v })} />
      <RichTextEditor
        label="본문 내용"
        value={card.content ?? ""}
        onChange={(v) => update({ content: v })}
        maxChars={maxChars}
        required
      />
    </div>
  );
}

// 글자 하단에 두꺼운 컬러 블록 깔리는 디자인 마크
const DESIGN_MARKS = [
  { key: "green",  label: "초록", solid: "#3D6B4F", rgba: "rgba(61,107,79,0.25)"    },
  { key: "amber",  label: "황토", solid: "#C4873A", rgba: "rgba(196,135,58,0.28)"   },
  { key: "blue",   label: "하늘", solid: "#5EA0DC", rgba: "rgba(94,160,220,0.28)"   },
  { key: "pink",   label: "분홍", solid: "#D26478", rgba: "rgba(210,100,120,0.25)"  },
];

// TipTap 커스텀 마크 — gradient 하단 블록
const DesignMark = Mark.create({
  name: "designMark",
  addAttributes() {
    return {
      color: {
        default: "green",
        parseHTML: el => el.getAttribute("data-dm"),
        renderHTML: attrs => ({ "data-dm": attrs.color, class: `dm-${attrs.color}` }),
      },
    };
  },
  parseHTML() { return [{ tag: "span[data-dm]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes), 0]; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toggleDesignMark: (attrs: { color: string }) => ({ commands }: { commands: any }) =>
        commands.toggleMark("designMark", attrs),
    };
  },
});

function RichTextEditor({ label, value, onChange, maxChars, required }: {
  label: string; value: string; onChange: (v: string) => void; maxChars?: number; required?: boolean;
}) {
  const [dmKey, setDmKey] = useState(DESIGN_MARKS[0].key);

  const editor = useEditor({
    extensions: [
      StarterKit,
      DesignMark,
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-editor",
        "data-placeholder": "말씀 요약 또는 핵심 내용을 입력하세요",
      },
    },
  });

  // 카드 전환 시 내용 갱신
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const textLen = editor?.getText().length ?? 0;
  const remaining = maxChars ? maxChars - textLen : null;
  const isWarn = remaining !== null && remaining <= 30;
  const isOver = remaining !== null && remaining < 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label className="label-sm" style={{ marginBottom: 0 }}>
          {label}{required && <span className="required-mark"> *</span>}
        </label>
        {maxChars && (
          <span style={{ fontSize: 11, color: isOver ? "#e05252" : isWarn ? "#C4873A" : "#BBBBBB" }}>
            {textLen} / {maxChars}
          </span>
        )}
      </div>

      {/* 툴바 */}
      <div className="rte-toolbar">
        <button
          type="button"
          className={`rte-btn${editor?.isActive("bold") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
          title="굵게 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`rte-btn${editor?.isActive("italic") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}
          title="기울임 (Ctrl+I)"
        >
          <em style={{ fontStyle: "italic" }}>I</em>
        </button>
        <div className="rte-divider" />
        {/* 디자인 마크 — 하단 블록 */}
        {DESIGN_MARKS.map((m) => (
          <button
            key={m.key}
            type="button"
            className="rte-btn"
            onMouseDown={(e) => {
              e.preventDefault();
              setDmKey(m.key);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor?.chain().focus() as any).toggleDesignMark({ color: m.key }).run();
            }}
            title={`${m.label} 마커`}
            style={{
              outline: dmKey === m.key ? `2px solid ${m.solid}` : "none",
              outlineOffset: 1,
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              backgroundImage: `linear-gradient(transparent 55%, ${m.rgba} 55%)`,
              padding: "0 3px",
            }}>A</span>
          </button>
        ))}
        <div className="rte-divider" />
        {([1, 2, 3] as const).map((level) => (
          <button
            key={level}
            type="button"
            className={`rte-btn${editor?.isActive("heading", { level }) ? " rte-btn--active" : ""}`}
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level }).run(); }}
            title={`제목 ${level}`}
          >
            <span style={{ fontSize: 11, fontWeight: 700 }}>H{level}</span>
          </button>
        ))}
        <button
          type="button"
          className={`rte-btn${editor?.isActive("paragraph") && !editor?.isActive("heading") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setParagraph().run(); }}
          title="본문"
        >
          <span style={{ fontSize: 11 }}>¶</span>
        </button>
      </div>

      {/* TipTap 에디터 */}
      <EditorContent editor={editor} />

      {isOver && (
        <p className="error-text" style={{ marginTop: 4 }}>
          카드에서 내용이 잘릴 수 있습니다 ({Math.abs(remaining!)}자 초과)
        </p>
      )}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, required }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="label-sm">{label}{required && <span className="required-mark"> *</span>}</label>
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}


function EditorPreviewCard({ card, format, templateColor, templateIsLight, cardIndex, totalCards, seriesName }: {
  card: CardData; format: "feed" | "story"; templateColor: string; templateIsLight: boolean;
  cardIndex: number; totalCards: number; seriesName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / 1080);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const cardH = format === "story" ? 1920 : 1350;

  return (
    <div
      ref={ref}
      className="editor-preview-card"
      style={{ aspectRatio: format === "story" ? "9/16" : "4/5" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left", width: 1080, height: cardH }}>
        <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format={format} cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />
      </div>
    </div>
  );
}
