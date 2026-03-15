import { supabase, CardSet } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ArchiveClient from "./ArchiveClient";

async function getCardSets(): Promise<CardSet[]> {
  try {
    const { data } = await supabase
      .from("cardsets")
      .select("*")
      .order("date", { ascending: false });
    return (data as CardSet[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ArchivePage() {
  const cardsets = await getCardSets();

  // 월별 그룹
  const grouped: Record<string, CardSet[]> = {};
  for (const cs of cardsets) {
    const month = cs.date?.slice(0, 7) ?? "기타";
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(cs);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title="보관함" />

      <main style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 24, fontWeight: 700, color: "#1E1E1C", marginBottom: 6 }}>
              보관함
            </h1>
            <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#7A7A72" }}>
              총 {cardsets.length}개의 말씀 카드
            </p>
          </div>
          <Link href="/editor" className="btn btn-primary">새로 만들기 +</Link>
        </div>

        {cardsets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#7A7A72", fontFamily: '"Suit", sans-serif', fontSize: 15 }}>
            아직 저장된 카드가 없습니다
          </div>
        ) : (
          <ArchiveClient grouped={grouped} />
        )}
      </main>

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 12, color: "#aaa" }}>나무카드 · 나무십자가교회 · made by tomob</p>
      </footer>
    </div>
  );
}
