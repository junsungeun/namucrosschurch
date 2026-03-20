import Link from "next/link";

export default function PageHeader({ title }: { title?: string }) {
  return (
    <header className="header">
      <Link href="/" className="header-brand">나무카드.</Link>
      {title && (
        <>
          <span className="header-divider">/</span>
          <span className="header-title">{title}</span>
        </>
      )}
      <div className="header-spacer" />
      <nav className="header-nav">
        <Link href="/archive" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }}>보관함</Link>
        <Link href="/editor" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>만들기</Link>
      </nav>
    </header>
  );
}
