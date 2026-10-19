import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import MovedBanner from "./components/MovedBanner";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin", "hebrew"],
});

export const metadata: Metadata = {
  // Canonical host; the same deployment also answers on hamadad-phi.vercel.app.
  metadataBase: new URL(SITE_URL),
  // "./" resolves per route, so every page names its own path on the canonical host.
  alternates: { canonical: "./" },
  title: "מדד על מחירי מזון",
  description: "מדד מחירי מזון שבועי המבוסס על נתוני הסופרמרקטים בישראל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-assistant)] bg-gray-50">
        {children}
        <MovedBanner newHost={SITE_HOST} lang="he" />
        <Analytics />
      </body>
    </html>
  );
}
