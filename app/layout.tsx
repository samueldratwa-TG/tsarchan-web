import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin", "hebrew"],
});

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
