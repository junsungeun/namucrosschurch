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
        <Link href="/article-editor" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }}>아티클 작성</Link>
        <Link href="/create" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>카드뉴스 생성</Link>
      </nav>
    </header>
  );
}
