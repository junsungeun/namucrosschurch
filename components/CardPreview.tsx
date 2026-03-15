"use client";

import { CardData } from "@/lib/store";

// 템플릿 컬러 정의
export const TEMPLATES = [
  { id: "template-a", name: "Green", format: "feed",  bgColor: "#2D5A3D", textColor: "#FFFFFF" },
  { id: "template-b", name: "Dark",  format: "feed",  bgColor: "#1E1E1C", textColor: "#FFFFFF" },
  { id: "template-c", name: "Cream", format: "feed",  bgColor: "#C4873A", textColor: "#FFFFFF" },
  { id: "template-d", name: "Sage",  format: "feed",  bgColor: "#4A6741", textColor: "#FFFFFF" },
  { id: "template-a-s", name: "Green", format: "story", bgColor: "#2D5A3D", textColor: "#FFFFFF" },
  { id: "template-b-s", name: "Dark",  format: "story", bgColor: "#1E1E1C", textColor: "#FFFFFF" },
  { id: "template-c-s", name: "Cream", format: "story", bgColor: "#C4873A", textColor: "#FFFFFF" },
  { id: "template-d-s", name: "Sage",  format: "story", bgColor: "#4A6741", textColor: "#FFFFFF" },
];

type Props = {
  card: CardData;
  templateColor: string;
  format: "feed" | "story";
  cardIndex: number;
  totalCards: number;
  seriesName?: string;
};

export default function CardPreview({
  card,
  templateColor,
  format,
  cardIndex,
  totalCards,
  seriesName,
}: Props) {
  const isFeed = format === "feed";
  const w = isFeed ? 540 : 304;
  const h = isFeed ? 540 : 540;

  const containerStyle: React.CSSProperties = {
    width: w,
    height: h,
    background: card.type === "cover" ? templateColor : "#FFFFFF",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    border: card.type === "body" ? "0.5px solid rgba(0,0,0,0.1)" : "none",
    fontFamily: '"GMarketSans", sans-serif',
  };

  return (
    <div style={containerStyle} id={`card-render-${cardIndex}`}>
      {card.type === "cover" ? (
        <CoverCard card={card} color={templateColor} />
      ) : (
        <BodyCard card={card} cardIndex={cardIndex} totalCards={totalCards} series={seriesName} />
      )}
    </div>
  );
}

function CoverCard({ card }: { card: CardData; color?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "36px 32px" }}>
      {/* 상단 시리즈 */}
      <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.65)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {card.series || "나무십자가교회"}
      </div>

      {/* 중앙 제목 영역 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, marginBottom: 16 }}>
          {card.title || "설교 제목"}
        </div>
        {card.scripture && (
          <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
            {card.scripture}
          </div>
        )}
      </div>

      {/* 하단 브랜드바 */}
      <BrandBar date={card.date} cardIndex={0} totalCards={1} dark />
    </div>
  );
}

function BodyCard({ card, cardIndex, totalCards, series }: { card: CardData; cardIndex: number; totalCards: number; series?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "32px 28px" }}>
      {/* 소제목 */}
      {card.subtitle && (
        <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 13, fontWeight: 700, color: "#1E1E1C", marginBottom: 14, letterSpacing: "-0.01em" }}>
          {card.subtitle}
        </div>
      )}

      {/* 구분선 */}
      <div style={{ width: 24, height: 2, background: "#3D6B4F", marginBottom: 16 }} />

      {/* 본문 */}
      <div style={{ flex: 1, fontFamily: '"Suit", sans-serif', fontSize: 14, fontWeight: 400, color: "#555555", lineHeight: 1.85, overflow: "hidden" }}>
        {card.content || "본문 내용"}
      </div>

      {/* 하단 브랜드바 */}
      <BodyBrandBar cardIndex={cardIndex} totalCards={totalCards} series={series} />
    </div>
  );
}

function BrandBar({ date, cardIndex, totalCards, dark }: { date?: string; cardIndex: number; totalCards: number; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="play-circle">
          <div className="play-triangle" />
        </div>
        <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 11, fontWeight: 700, color: dark ? "rgba(255,255,255,0.9)" : "#1E1E1C" }}>
          나무카드.
        </span>
      </div>
      <div style={{ textAlign: "right" }}>
        {date && <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 10, color: dark ? "rgba(255,255,255,0.6)" : "#7A7A72" }}>{date}</div>}
        <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 10, color: dark ? "rgba(255,255,255,0.4)" : "#aaa" }}>
          {cardIndex + 1} / {totalCards}
        </div>
      </div>
    </div>
  );
}

function BodyBrandBar({ cardIndex, totalCards, series }: { cardIndex: number; totalCards: number; series?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 12, marginTop: 12 }}>
      <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 11, fontWeight: 700, color: "#1E1E1C" }}>
        나무카드.
      </span>
      <span style={{ fontFamily: '"Suit", sans-serif', fontSize: 10, color: "#aaa" }}>
        {series ? `${series} · ` : ""}{cardIndex + 1} / {totalCards}
      </span>
    </div>
  );
}
