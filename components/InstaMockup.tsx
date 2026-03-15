"use client";

import CardPreview from "./CardPreview";
import { CardData } from "@/lib/store";

type Props = {
  card: CardData;
  templateColor: string;
  format: "feed" | "story";
  cardIndex: number;
  totalCards: number;
  seriesName?: string;
};

export default function InstaMockup({ card, templateColor, format, cardIndex, totalCards, seriesName }: Props) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #dbdbdb",
      borderRadius: 4,
      width: 375,
      fontFamily: "-apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* 프로필 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#2D5A3D",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>나무</span>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>namucard</div>
          <div style={{ fontSize: 10, color: "#8e8e8e" }}>나무십자가교회</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 18, color: "#000" }}>···</div>
      </div>

      {/* 카드 이미지 */}
      <div style={{ width: 375, height: 375, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
        <div style={{ transform: "scale(0.694)", transformOrigin: "top left", width: 540, height: 540, flexShrink: 0 }}>
          <CardPreview
            card={card}
            templateColor={templateColor}
            format={format}
            cardIndex={cardIndex}
            totalCards={totalCards}
            seriesName={seriesName}
          />
        </div>
      </div>

      {/* 좋아요 바 */}
      <div style={{ padding: "8px 14px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>♡</span>
          <span style={{ fontSize: 22 }}>💬</span>
          <span style={{ fontSize: 22 }}>✈</span>
          <span style={{ marginLeft: "auto", fontSize: 22 }}>🔖</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#000", marginBottom: 4 }}>좋아요 0개</div>
        <div style={{ fontSize: 12, color: "#000" }}>
          <span style={{ fontWeight: 600 }}>namucard</span>{" "}
          <span style={{ color: "#8e8e8e" }}>
            {card.type === "cover" ? (card.title || "설교 제목") : (card.subtitle || "본문 카드")}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#8e8e8e", marginTop: 4 }}>방금</div>
      </div>
    </div>
  );
}
