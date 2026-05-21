import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const body = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const display = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "OCR Studio — 日本語テキスト抽出",
  description: "縦書き・多段組みPDF/画像からテキストを抽出するWebアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${body.variable} ${display.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
