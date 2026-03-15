"use client";

import { CardSet } from "@/lib/supabase";
import Image from "next/image";

type Props = { grouped: Record<string, CardSet[]> };

export default function ArchiveClient({ grouped }: Props) {
  async function redownload(cs: CardSet) {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (let i = 0; i < cs.card_urls.length; i++) {
      const res = await fetch(cs.card_urls[i]);
      const blob = await res.blob();
      zip.file(`카드_${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `나무카드_${cs.date}.zip`;
    a.click();
  }

  function copyArticleLink(id: string) {
    const url = `${window.location.origin}/article/${id}`;
    navigator.clipboard.writeText(url);
    alert("링크가 복사되었습니다!");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <div style={{
            fontFamily: '"GMarketSans", sans-serif',
            fontSize: 13, fontWeight: 700,
            color: "#7A7A72",
            letterSpacing: "0.05em",
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}>
            {month}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((cs) => (
              <div key={cs.id} className="card-box" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {/* 썸네일 */}
                <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "#2D5A3D", flexShrink: 0 }}>
                  {cs.card_urls?.[0] ? (
                    <Image src={cs.card_urls[0]} alt="" width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 9, color: "rgba(255,255,255,0.7)" }}>나무카드.</span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 15, fontWeight: 700, color: "#1E1E1C", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cs.title}
                  </div>
                  <div style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#7A7A72" }}>
                    {cs.date} · {cs.series ?? ""} {cs.scripture ? `· ${cs.scripture}` : ""}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {cs.youtube_url && (
                    <a href={cs.youtube_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                      ▶ 설교보기
                    </a>
                  )}
                  <button onClick={() => redownload(cs)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                    ↓ 재다운로드
                  </button>
                  <button onClick={() => copyArticleLink(cs.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                    🔗 아티클
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
