import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "나무카드 | 나무십자가교회",
  description: "주일예배 말씀 카드뉴스 + 아티클 자동 생성",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={dmSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
