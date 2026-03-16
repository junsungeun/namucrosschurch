"use client";

import CardPreview from "./CardPreview";
import { CardData } from "@/lib/store";

type Props = {
  card: CardData;
  templateColor: string;
  templateIsLight?: boolean;
  format: "feed" | "story";
  cardIndex: number;
  totalCards: number;
  seriesName?: string;
};

export default function InstaMockup({ card, templateColor, templateIsLight, format, cardIndex, totalCards, seriesName }: Props) {
  if (format === "story") {
    return <StoryMockup card={card} templateColor={templateColor} templateIsLight={templateIsLight} cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />;
  }
  return <FeedMockup card={card} templateColor={templateColor} templateIsLight={templateIsLight} cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />;
}

/* ── 피드 목업 (1:1) ── */
function FeedMockup({ card, templateColor, templateIsLight, cardIndex, totalCards, seriesName }: Omit<Props, "format">) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dbdbdb", borderRadius: 4, width: 375, fontFamily: "-apple-system, sans-serif", overflow: "hidden" }}>
      {/* 프로필 헤더 */}
      <ProfileHeader />

      {/* 카드 (375x375) — 1080px 카드를 375/1080 = 0.347 스케일 */}
      <div style={{ width: 375, height: 375, overflow: "hidden", position: "relative" }}>
        <div style={{ transform: "scale(0.347)", transformOrigin: "top left", width: 1080, height: 1080, position: "absolute", top: 0, left: 0 }}>
          <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format="feed" cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />
        </div>
      </div>

      {/* 좋아요 바 */}
      <LikeBar card={card} />
    </div>
  );
}

/* ── 스토리 목업 (9:16) ── */
function StoryMockup({ card, templateColor, templateIsLight, cardIndex, totalCards, seriesName }: Omit<Props, "format">) {
  // 카드 실제 크기: 1080×1920
  // 목업 표시 크기: 375×667 (9:16) → scale = 375/1080 = 0.347
  const scale = 375 / 1080;

  return (
    <div style={{ background: "#000", borderRadius: 12, width: 375, height: 667, fontFamily: "-apple-system, sans-serif", overflow: "hidden", position: "relative" }}>
      {/* 상단 스토리 UI */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "12px 16px 0" }}>
        <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i === 0 ? "#fff" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3D6B4F", border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>나무</span>
          </div>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>namucross.church</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>방금</span>
        </div>
      </div>

      {/* 카드 이미지 — 540×960을 375×667로 축소 */}
      <div style={{ width: 375, height: 667, overflow: "hidden", position: "relative" }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1080, height: 1920, position: "absolute", top: 0, left: 0, flexShrink: 0 }}>
          <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format="story" cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />
        </div>
      </div>

      {/* 하단 답장 UI */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          답장 보내기...
        </div>
        <span style={{ fontSize: 22 }}>♡</span>
        <span style={{ fontSize: 22 }}>✈</span>
      </div>
    </div>
  );
}

function ProfileHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3D6B4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>나무</span>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>namucard</div>
        <div style={{ fontSize: 10, color: "#8e8e8e" }}>나무십자가교회</div>
      </div>
      <div style={{ marginLeft: "auto", fontSize: 18, color: "#000" }}>···</div>
    </div>
  );
}

function LikeBar({ card }: { card: CardData }) {
  return (
    <div style={{ padding: "8px 14px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>♡</span>
        <span style={{ fontSize: 22 }}>💬</span>
        <span style={{ fontSize: 22 }}>✈</span>
        <span style={{ marginLeft: "auto", fontSize: 22 }}>🔖</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#000", marginBottom: 4 }}>좋아요 0개</div>
      <div style={{ fontSize: 12, color: "#8e8e8e" }}>
        {card.type === "cover" ? (card.title || "설교 제목") : (card.subtitle || "본문 카드")}
      </div>
      <div style={{ fontSize: 11, color: "#8e8e8e", marginTop: 4 }}>방금</div>
    </div>
  );
}
