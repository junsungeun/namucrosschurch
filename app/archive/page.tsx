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
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="4" stroke="var(--border)" strokeWidth="2" fill="none" />
                <path d="M8 22H56" stroke="var(--border)" strokeWidth="2" />
                <circle cx="32" cy="36" r="8" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" opacity="0.4" />
                <path d="M28 36L31 39L36 33" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
              </svg>
            </div>
            <p className="empty-state-text">아직 저장된 카드가 없습니다</p>
            <p className="empty-state-sub">에디터에서 말씀 카드를 만들어보세요</p>
            <Link href="/editor" className="btn btn-primary" style={{ marginTop: 16 }}>카드 만들기</Link>
          </div>
        ) : (
          <ArchiveClient grouped={grouped} />
        )}
      </main>
      <footer className="page-footer"><p>나무카드 · 나무십자가교회 · made by tomob</p></footer>
    </div>
  );
}
