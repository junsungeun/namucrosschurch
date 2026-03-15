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
      const { supabase } = await import("@/lib/supabase");

      const cardUrls: string[] = [];

      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
        const arrayBuffer = await blob.arrayBuffer();
        const filename = `${Date.now()}_card_${i + 1}.png`;
        const { data, error } = await supabase.storage.from("cards").upload(filename, arrayBuffer, { contentType: "image/png" });
        if (error) { setSaveError(`스토리지 오류: ${error.message}`); return; }
        if (data) {
          const { data: urlData } = supabase.storage.from("cards").getPublicUrl(data.path);
          cardUrls.push(urlData.publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("cardsets").insert({
        date: coverCard.date ?? "",
        title: coverCard.title ?? "",
        series: coverCard.series,
        scripture: coverCard.scripture,
        summary: cards.find((c) => c.type === "body")?.content,
        youtube_url: youtubeUrl || null,
        template_id: "template-a",
        format,
        card_urls: cardUrls,
      });

      if (insertError) { setSaveError(`DB 오류: ${insertError.message}`); return; }
      setSaved(true);
    } catch (e) {
      setSaveError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title="생성 완료" />

      <main style={{ flex: 1, maxWidth: 960, margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 24, fontWeight: 700, color: "#1E1E1C", marginBottom: 6 }}>
              카드 생성 완료
            </h1>
            <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#7A7A72" }}>
              총 {cards.length}장 · {format === "feed" ? "피드 1:1" : "스토리 9:16"}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={downloadAll} className="btn btn-secondary">전체 ZIP 다운로드</button>
              <button
                onClick={saveToSupabase}
                className="btn btn-primary"
                disabled={saving || saved}
              >
                {saved ? "✓ 저장 완료" : saving ? "저장 중..." : "보관함에 저장"}
              </button>
            </div>
            {saveError && (
              <p style={{ fontSize: 12, color: "#e05252", fontFamily: '"Suit", sans-serif' }}>{saveError}</p>
            )}
          </div>
        </div>

        {/* 카드 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
          {cards.map((card, i) => (
            <div key={card.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* 실제 해상도 렌더 — html2canvas가 이 div를 캡처 */}
              <div ref={(el) => { cardRefs.current[i] = el; }} style={{ position: "absolute", left: -9999, top: -9999 }}>
                <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format={format} cardIndex={i} totalCards={cards.length} seriesName={coverCard.series} />
              </div>
              {/* 썸네일 — 셀 너비에 맞게 동적 스케일 */}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#7A7A72" }}>
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
        <div style={{ background: "#E8F2EB", borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 14, fontWeight: 700, color: "#3D6B4F", marginBottom: 14 }}>
            인스타그램 업로드 순서
          </div>
          <ol style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#3D6B4F", paddingLeft: 20, lineHeight: 1.9 }}>
            {cards.map((_, i) => (
              <li key={i}>{i === 0 ? "표지 카드 (1번)" : `${i}번 카드`}</li>
            ))}
          </ol>
        </div>

        {/* 하단 링크 */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/editor" className="btn btn-secondary">← 에디터로 돌아가기</Link>
          <Link href="/archive" className="btn btn-primary">보관함 보기 →</Link>
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
    <div ref={ref} style={{ width: "100%", aspectRatio: format === "story" ? "9/16" : "1/1", overflow: "hidden", position: "relative", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left", width: 1080, height: cardH }}>
        <CardPreview card={card} templateColor={templateColor} templateIsLight={templateIsLight} format={format} cardIndex={cardIndex} totalCards={totalCards} seriesName={seriesName} />
      </div>
    </div>
  );
}
