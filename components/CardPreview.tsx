"use client";

import { CardData } from "@/lib/store";

export const TEMPLATES = [
  { id: "tpl-green",    name: "A · Green",  format: "feed",  bgColor: "#3D6B4F", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-lime",     name: "B · Lime",   format: "feed",  bgColor: "#E8F2EB", textColor: "#1E1E1C", isLight: true  },
  { id: "tpl-dark",     name: "C · Dark",   format: "feed",  bgColor: "#1E2E24", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-accent",   name: "D · Accent", format: "feed",  bgColor: "#C4873A", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-green-s",  name: "A · Green",  format: "story", bgColor: "#3D6B4F", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-lime-s",   name: "B · Lime",   format: "story", bgColor: "#E8F2EB", textColor: "#1E1E1C", isLight: true  },
  { id: "tpl-dark-s",   name: "C · Dark",   format: "story", bgColor: "#1E2E24", textColor: "#FFFFFF", isLight: false },
  { id: "tpl-accent-s", name: "D · Accent", format: "story", bgColor: "#C4873A", textColor: "#FFFFFF", isLight: false },
];

const F_SERIF = 'var(--font-dm-serif), "DM Serif Display", serif';
const F_BODY  = '"Suit", "Noto Sans KR", sans-serif';
const F_HEAD  = '"GMarketSans", sans-serif';

// 실제 출력 해상도
export const CARD_W = 1080;
export const CARD_H_FEED  = 1080;
export const CARD_H_STORY = 1920;

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
  const w = CARD_W;
  const h = format === "story" ? CARD_H_STORY : CARD_H_FEED;

  return (
    <div
      id={`card-render-${cardIndex}`}
      style={{
        width: w, height: h,
        background: card.type === "cover" ? templateColor : "#FFFFFF",
        border: card.type === "body" ? "1px solid rgba(0,0,0,0.1)" : "none",
        flexShrink: 0, overflow: "hidden",
      }}
    >
      {card.type === "cover"
        ? <CoverCard card={card} isLight={templateIsLight} cardIndex={cardIndex} totalCards={totalCards} />
        : <BodyCard  card={card} cardIndex={cardIndex} totalCards={totalCards} series={seriesName} />
      }
    </div>
  );
}

/* ── 표지 카드 ── */
function CoverCard({ card, isLight, cardIndex, totalCards }: {
  card: CardData; isLight: boolean; cardIndex: number; totalCards: number;
}) {
  const fg         = isLight ? "#1E1E1C" : "#FFFFFF";
  const fgSub      = isLight ? "rgba(0,0,0,0.45)"  : "rgba(255,255,255,0.45)";
  const divider    = isLight ? "rgba(0,0,0,0.12)"  : "rgba(255,255,255,0.2)";
  const playBorder = isLight ? "rgba(0,0,0,0.2)"   : "rgba(255,255,255,0.4)";
  const playFill   = isLight ? "rgba(0,0,0,0.5)"   : "rgba(255,255,255,0.8)";
  const numColor   = isLight ? "rgba(0,0,0,0.3)"   : "rgba(255,255,255,0.4)";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96 }}>
      {/* 제목 */}
      <div style={{
        flex: 1,
        fontFamily: F_HEAD,
        fontWeight: 700,
        fontSize: 96,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        wordBreak: "keep-all",
        color: fg,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: 8,
      }}>
        {card.title || "설교 제목"}
      </div>

      {/* 하단 브랜드바 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ height: 1, background: divider }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: F_SERIF, fontSize: 30, color: fg, letterSpacing: "-0.01em" }}>
                Namucross.church
              </span>
              {card.series && (
                <span style={{ fontFamily: F_BODY, fontWeight: 400, fontSize: 22, color: fg, opacity: 0.55 }}>
                  {card.series}
                </span>
              )}
            </div>
            <div style={{ fontFamily: F_BODY, fontSize: 22, color: fgSub, letterSpacing: "0.03em" }}>
              {[card.scripture, card.date].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <div style={{ fontFamily: F_BODY, fontSize: 22, color: numColor, letterSpacing: "0.06em" }}>
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
    <div style={{ width: "100%", height: "100%", background: "#FFFFFF", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96 }}>
      {/* 상단 콘텐츠 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28, overflow: "hidden" }}>
        {card.subtitle && (
          <div style={{ fontFamily: F_BODY, fontWeight: 600, fontSize: 30, color: "#1E1E1C" }}>
            {card.subtitle}
          </div>
        )}
        <div style={{
          fontFamily: F_BODY,
          fontWeight: 400,
          fontSize: 28,
          color: "#444444",
          lineHeight: 1.9,
          wordBreak: "keep-all",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}>
          {card.content || "본문 내용을 입력하세요"}
        </div>
      </div>

      {/* 하단 브랜드바 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 32 }}>
        <div style={{ height: 1, background: "rgba(0,0,0,0.1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: F_SERIF, fontSize: 26, color: "#1E1E1C" }}>
                Namucross.church
              </span>
              {series && (
                <span style={{ fontFamily: F_BODY, fontSize: 20, color: "#7A7A72", opacity: 0.7 }}>
                  {series}
                </span>
              )}
            </div>
            <div style={{ fontFamily: F_BODY, fontSize: 20, color: "#7A7A72", opacity: 0.5 }}>
              나무십자가교회
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <div style={{ fontFamily: F_BODY, fontSize: 22, color: "#C0C0C0", letterSpacing: "0.06em" }}>
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
      width: 56, height: 56, borderRadius: "50%",
      border: `3px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{
        width: 0, height: 0, marginLeft: 4,
        borderTop: "8px solid transparent",
        borderBottom: "8px solid transparent",
        borderLeft: `13px solid ${fill}`,
      }} />
    </div>
  );
}
