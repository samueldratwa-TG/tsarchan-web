import { HeroSection } from "@/components/home/HeroSection";
import { IndexWidget } from "@/components/home/IndexWidget";
import { AppGrid } from "@/components/home/AppGrid";
import { LatestPosts } from "@/components/home/LatestPosts";
import { apps } from "@/lib/apps-data";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IndexWidget />
      <AppGrid />
      <LatestPosts />
      <JsonLd />
    </>
  );
}

function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "הצרחן הנבון",
        url: "https://sadot.click",
        description:
          "כלים חכמים אך פשוטים לחיי יומיום — מדד מזון, מחשבון מוניות, השוואת חשמל, שבעתיים, סטטוס טיסה",
        inLanguage: "he",
      },
      {
        "@type": "Person",
        name: "שמואל דרטבה",
        alternateName: "Samuel Dratwa",
        url: "https://sadot.click/about",
      },
      {
        "@type": "ItemList",
        name: "הכלים של הצרחן הנבון",
        itemListElement: apps.map((app, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareApplication",
            name: app.name,
            url: app.url,
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
