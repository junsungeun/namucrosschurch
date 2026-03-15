import Link from "next/link";

export default function PageHeader({ title }: { title?: string }) {
  return (
    <header style={{
      height: 56,
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 16,
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ fontFamily: '"GMarketSans", sans-serif', fontWeight: 700, fontSize: 15, color: "#3D6B4F", textDecoration: "none" }}>
        나무카드.
      </Link>
      {title && (
        <>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
          <span style={{ fontFamily: '"Suit", sans-serif', fontSize: 13, color: "#7A7A72" }}>{title}</span>
        </>
      )}
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", gap: 8 }}>
        <Link href="/archive" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }}>보관함</Link>
        <Link href="/editor" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>만들기</Link>
      </nav>
    </header>
  );
}
