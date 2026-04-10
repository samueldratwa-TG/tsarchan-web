import type { Metadata } from "next";
import { Heebo, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/lib/theme";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sadot.click"),
  title: {
    default: "הצרחן הנבון — כלים חכמים אך פשוטים לחיי יומיום",
    template: "%s | הצרחן הנבון",
  },
  description:
    "מדד מחירי מזון יומי, מחשבון מחיר נסיעה במונית, השוואת מסלולי חשמל, תיאום ביקורי ניחום, מעקב סטטוס טיסות — כלים חינמיים שנבנו מהחוויה האישית",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://sadot.click",
    siteName: "הצרחן הנבון",
    title: "הצרחן הנבון — כלים חכמים אך פשוטים לחיי יומיום",
    description:
      "מדד מחירי מזון יומי, מחשבון מחיר נסיעה במונית, השוואת מסלולי חשמל, תיאום ביקורי ניחום, מעקב סטטוס טיסות — כלים חינמיים שנבנו מהחוויה האישית",
  },
  twitter: {
    card: "summary_large_image",
    title: "הצרחן הנבון — כלים חכמים אך פשוטים לחיי יומיום",
    description:
      "כלים חינמיים לישראלים — מדד מזון, מחשבון מוניות, השוואת חשמל, שבעתיים, סטטוס טיסה",
  },
  alternates: {
    canonical: "https://sadot.click",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "gS9Nt2h7Oxn86Sm5O_w8Q5rqpP7DDNrKyOduTRoTDuk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">
            דלג לתוכן הראשי
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
