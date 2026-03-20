import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import localFont from "next/font/local";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const gmarketSans = localFont({
  src: [
    { path: "./fonts/GmarketSansBold.otf", weight: "700" },
    { path: "./fonts/GmarketSansMedium.otf", weight: "500" },
  ],
  variable: "--font-gmarket",
  display: "swap",
  preload: true,
});

const suit = localFont({
  src: [
    { path: "./fonts/SUIT-Regular.woff2", weight: "400" },
    { path: "./fonts/SUIT-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-suit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "나무카드 | 나무십자가교회",
  description: "주일예배 말씀 카드뉴스 + 아티클 자동 생성",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${dmSerif.variable} ${gmarketSans.variable} ${suit.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
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
