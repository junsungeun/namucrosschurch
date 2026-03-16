"use client";

import { useRef, useState, useEffect } from "react";
import { useEditorStore, CardData } from "@/lib/store";
import CardPreview from "@/components/CardPreview";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function DonePage() {
  const { cards, format, templateColor, templateIsLight, youtubeUrl } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const coverCard = cards[0];

  async function downloadCard(index: number) {
    const html2canvas = (await import("html2canvas")).default;
    const el = cardRefs.current[index];
    if (!el) return;
    const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `나무카드_${index + 1}.png`;
    a.click();
  }

  async function downloadAll() {
    const html2canvas = (await import("html2canvas")).default;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (let i = 0; i < cards.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      zip.file(`나무카드_${i + 1}.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `나무카드_${coverCard.date ?? "말씀"}.zip`;
    a.click();
  }

  async function saveToSupabase() {
    setSaving(true);
    setSaveError(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const images: string[] = [];

      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
        images.push(canvas.toDataURL("image/png"));
      }

      const res = await fetch("/api/save-cardset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          meta: {
            date: coverCard.date ?? "",
            title: coverCard.title ?? "",
            series: coverCard.series,
            scripture: coverCard.scripture,
            summary: cards.find((c) => c.type === "body")?.content,
            youtube_url: youtubeUrl || null,
            format,
          },
        }),
      });

      const json = await res.json();
      if (json.error) { setSaveError(json.error); return; }
      setSaved(true);
    } catch (e) {
      setSaveError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="생성 완료" />

      <main className="page-main page-main--wide">
        <div className="done-header">
          <div>
            <h1 className="heading-lg">카드 생성 완료</h1>
            <p className="sub-text">총 {cards.length}장 · {format === "feed" ? "피드 1:1" : "스토리 9:16"}</p>
          </div>
          <div className="done-actions">
            <div className="done-btns">
              <button onClick={downloadAll} className="btn btn-secondary">전체 ZIP 다운로드</button>
              <button
                onClick={saveToSupabase}
                className="btn btn-primary"
                disabled={saving || saved}
              >
                {saved ? "저장 완료" : saving ? "저장 중..." : "보관함에 저장"}
              </button>
            </div>
            {saveError && <p className="error-text">{saveError}</p>}
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="card-grid">
          {cards.map((card, i) => (
            <div key={card.id} className="thumb-card">
              {/* 실제 해상도 렌더 — html2canvas가 이 div를 캡처 */}
              <div ref={(el) => { cardRefs.current[i] = el; }} className="offscreen">
                <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format={format} cardIndex={i} totalCards={cards.length} seriesName={coverCard.series} />
              </div>
              {/* 썸네일 */}
              <CardThumbnail
                card={card}
                format={format}
                templateColor={templateColor}
                templateIsLight={templateIsLight}
                cardIndex={i}
                totalCards={cards.length}
                seriesName={coverCard.series}
              />
              {/* 라벨 + 다운로드 버튼 */}
              <div className="thumb-label">
                <span className="sub-text" style={{ fontSize: 12 }}>
                  {i === 0 ? "표지" : `${i}번 카드`}
                </span>
                <button onClick={() => downloadCard(i)} className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
                  PNG 다운로드
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 업로드 순서 안내 */}
        <div className="upload-guide">
          <div className="upload-guide-title">인스타그램 업로드 순서</div>
          <ol>
            {cards.map((_, i) => (
              <li key={i}>{i === 0 ? "표지 카드 (1번)" : `${i}번 카드`}</li>
            ))}
          </ol>
        </div>

        {/* 하단 링크 */}
        <div className="bottom-links">
          <Link href="/editor" className="btn btn-secondary">에디터로 돌아가기</Link>
          <Link href="/archive" className="btn btn-primary">보관함 보기</Link>
        </div>
      </main>
    </div>
  );
}

function CardThumbnail({ card, format, templateColor, templateIsLight, cardIndex, totalCards, seriesName }: {
  card: CardData; format: "feed" | "story"; templateColor: string; templateIsLight: boolean;
  cardIndex: number; totalCards: number; seriesName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / 1080);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const cardH = format === "story" ? 1920 : 1080;

  return (
    <div ref={ref} className="thumb-wrapper" style={{ aspectRatio: format === "story" ? "9/16" : "1/1" }}>
      <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left", width: 1080, height: cardH }}>
        <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format={format} cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />
      </div>
    </div>
  );
}
