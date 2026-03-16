import { supabase, CardSet } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ArchiveClient from "./ArchiveClient";

export const dynamic = "force-dynamic";

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

  const grouped: Record<string, CardSet[]> = {};
  for (const cs of cardsets) {
    const month = cs.date?.slice(0, 7) ?? "기타";
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(cs);
  }

  return (
    <div className="page-shell">
      <PageHeader title="보관함" />
      <main className="page-main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <h1 className="heading-lg">보관함</h1>
            <p className="sub-text">총 {cardsets.length}개의 말씀 카드</p>
          </div>
          <Link href="/editor" className="btn btn-primary">새로 만들기 +</Link>
        </div>
        {cardsets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontSize: 15 }}>
            아직 저장된 카드가 없습니다
          </div>
        ) : (
          <ArchiveClient grouped={grouped} />
        )}
      </main>
      <footer className="page-footer"><p>나무카드 · 나무십자가교회 · made by tomob</p></footer>
    </div>
  );
}
