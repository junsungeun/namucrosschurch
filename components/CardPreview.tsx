"use client";

import { CardData } from "@/lib/store";

export const TEMPLATES = [
  { id: "tpl-green",  name: "A · Green",  format: "feed",  bgColor: "#3D6B4F", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-lime",   name: "B · Lime",   format: "feed",  bgColor: "#E8F2EB", textColor: "#1E1E1C", isLight: true  },
  { id: "tpl-dark",   name: "C · Dark",   format: "feed",  bgColor: "#1E2E24", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-accent", name: "D · Accent", format: "feed",  bgColor: "#C4873A", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-green-s",  name: "A · Green",  format: "story", bgColor: "#3D6B4F", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-lime-s",   name: "B · Lime",   format: "story", bgColor: "#E8F2EB", textColor: "#1E1E1C", isLight: true  },
  { id: "tpl-dark-s",   name: "C · Dark",   format: "story", bgColor: "#1E2E24", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-accent-s", name: "D · Accent", format: "story", bgColor: "#C4873A", textColor: "#FFFFFF", isLight: false },
];

type Props = {
  card: CardData;
  templateColor: string;
  templateIsLight?: boolean;
  format: "feed" | "story";
  cardIndex: number;
  totalCards: number;
  seriesName?: string;
};

export default function CardPreview({
  card, templateColor, templateIsLight = false,
  format, cardIndex, totalCards, seriesName,
}: Props) {
  const size = format === "feed" ? 540 : 405; // feed 1:1, story 3:4 비율

  return (
    <div
      id={`card-render-${cardIndex}`}
      style={{
        width: size,
        height: size,
        background: card.type === "cover" ? templateColor : "#FFFFFF",
        border: card.type === "body" ? "0.5px solid rgba(0,0,0,0.1)" : "none",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {card.type === "cover"
        ? <CoverCard card={card} isLight={templateIsLight} cardIndex={cardIndex} totalCards={totalCards} />
        : <BodyCard card={card} cardIndex={cardIndex} totalCards={totalCards} series={seriesName} />
      }
    </div>
  );
}

/* ── 표지 카드 ── */
function CoverCard({ card, isLight, cardIndex, totalCards }: {
  card: CardData; isLight: boolean; cardIndex: number; totalCards: number;
}) {
  const fg = isLight ? "#1E1E1C" : "#FFFFFF";
  const fgSub = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const divider = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)";
  const playBorder = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)";
  const playFill = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(24px,5%,48px)" as string }}>
      {/* 제목 — flex:1로 공간 채움 */}
      <div style={{
        flex: 1,
        fontFamily: '"GMarketSans", sans-serif',
        fontWeight: 700,
        fontSize: 42,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        wordBreak: "keep-all",
        color: fg,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: 4,
      }}>
        {card.title || "설교 제목"}
      </div>

      {/* 하단 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ height: 1, background: divider }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* 좌: 브랜드 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: '"GMarketSans", sans-serif', fontWeight: 700, fontSize: 14, color: fg, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 4 }}>
              나무카드.
              <span style={{ fontWeight: 500, opacity: 0.55, fontSize: "0.85em", color: fg }}>주일예배</span>
            </div>
            <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 11, color: fgSub, letterSpacing: "0.03em" }}>
              {[card.scripture, card.date].filter(Boolean).join(" · ")}
            </div>
          </div>
          {/* 우: 번호 + 플레이버튼 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 11, color: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
              {String(cardIndex + 1).padStart(2, "0")} / {String(totalCards).padStart(2, "0")}
            </div>
            <PlayBtn border={playBorder} fill={playFill} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 본문 카드 ── */
function BodyCard({ card, cardIndex, totalCards, series }: {
  card: CardData; cardIndex: number; totalCards: number; series?: string;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(24px,5%,48px)" as string }}>
      {/* 상단: 소제목 + 본문 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflow: "hidden" }}>
        {card.subtitle && (
          <div style={{ fontFamily: '"Suit", sans-serif', fontWeight: 700, fontSize: 15, color: "#1E1E1C", lineHeight: 1.5, wordBreak: "keep-all" }}>
            {card.subtitle}
          </div>
        )}
        <div style={{ fontFamily: '"Suit", sans-serif', fontWeight: 400, fontSize: 13, color: "#444444", lineHeight: 1.9, wordBreak: "keep-all", overflow: "hidden" }}>
          {card.content || "본문 내용을 입력하세요"}
        </div>
      </div>

      {/* 하단 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        <div style={{ height: 1, background: "rgba(0,0,0,0.1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* 좌: 브랜드 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: '"GMarketSans", sans-serif', fontWeight: 700, fontSize: 14, color: "#1E1E1C", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 5 }}>
              나무카드.
              {series && (
                <span style={{ fontWeight: 400, fontFamily: '"Suit", sans-serif', fontSize: "0.8em", color: "#7A7A72", opacity: 0.7 }}>
                  {series}
                </span>
              )}
            </div>
            <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 11, color: "#7A7A72", opacity: 0.5, letterSpacing: "0.03em" }}>
              나무십자가교회
            </div>
          </div>
          {/* 우: 번호 + 플레이버튼 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 11, color: "#C0C0C0", letterSpacing: "0.06em" }}>
              {String(cardIndex + 1).padStart(2, "0")} / {String(totalCards).padStart(2, "0")}
            </div>
            <PlayBtn border="#DDDDDD" fill="#999999" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 플레이버튼 ── */
function PlayBtn({ border, fill }: { border: string; fill: string }) {
  return (
    <div style={{
      width: 28, height: 28,
      borderRadius: "50%",
      border: `1.5px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{
        width: 0, height: 0,
        marginLeft: 2,
        borderTop: "4px solid transparent",
        borderBottom: "4px solid transparent",
        borderLeft: `6.5px solid ${fill}`,
      }} />
    </div>
  );
}
