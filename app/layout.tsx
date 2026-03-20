import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
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
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* GMarketSans — UI 메인 폰트 preload */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}
