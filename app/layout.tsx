import type { Metadata, Viewport } from "next";
import { Inter, Noto_Naskh_Arabic, Geist_Mono } from "next/font/google";
import { ClickFeedback } from "@/components/shared/click-feedback";
import { InstallPrompt } from "@/components/shared/install-prompt";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const TITLE = "Darul Arqam";
const DESCRIPTION = "Lecture et analyse numérique du Coran par guématrie arabe.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B6B3A",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: TITLE,
  appleWebApp: {
    title: TITLE,
    statusBarStyle: "default",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <ClickFeedback />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
