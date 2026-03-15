import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나무카드 | 나무십자가교회",
  description: "주일예배 말씀 카드뉴스 + 아티클 자동 생성",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
