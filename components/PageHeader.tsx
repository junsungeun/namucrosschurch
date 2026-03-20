import Link from "next/link";

export default function PageHeader({ title }: { title?: string }) {
  return (
    <>
      <style>{`
        .ph-header {
          border-bottom: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center;
          flex-wrap: wrap;
          padding: 0 24px;
          min-height: 56px;
          gap: 0;
        }
        .ph-left {
          display: flex; align-items: center; gap: 10px;
          height: 56px; flex: 1; min-width: 0;
        }
        .ph-nav {
          display: flex; gap: 8px; align-items: center;
          height: 56px;
        }
        @media (max-width: 480px) {
          .ph-header { padding: 0 16px; }
          .ph-nav {
            width: 100%; height: auto;
            padding: 0 0 10px;
            border-top: 1px solid rgba(0,0,0,0.06);
          }
          .ph-nav a { flex: 1; justify-content: center; font-size: 12px !important; padding: 7px 8px !important; }
        }
      `}</style>
      <header className="ph-header">
        <div className="ph-left">
          <Link href="/" className="header-brand">나무카드.</Link>
          {title && (
            <>
              <span className="header-divider">/</span>
              <span className="header-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            </>
          )}
        </div>
        <nav className="ph-nav">
          <Link href="/article-editor" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }}>아티클 작성</Link>
          <Link href="/create" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>카드뉴스 생성</Link>
        </nav>
      </header>
    </>
  );
}
