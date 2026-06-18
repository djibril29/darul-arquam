import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic, Geist_Mono } from "next/font/google";
import { ClickFeedback } from "@/components/shared/click-feedback";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Darul Arqam",
  description: "Lecture et analyse numérique du Coran par guématrie arabe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${notoNaskhArabic.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--font-headings": "var(--font-body)" } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClickFeedback />
        {children}
      </body>
    </html>
  );
}
