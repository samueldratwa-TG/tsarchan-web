import type { Metadata } from "next";
import { ExternalLink, BookOpen } from "lucide-react";
import { apps } from "@/lib/apps-data";
import { StatusBadge } from "@/components/apps/StatusBadge";

export const metadata: Metadata = {
  title: "הכלים של הצרחן הנבון — כל האפליקציות במקום אחד",
  description:
    "מדד מחירי מזון, מחשבון נסיעות במונית, השוואת חשמל, שבעתיים, סטטוס טיסה — כלים חינמיים לישראלים",
  alternates: { canonical: "https://sadot.click/apps" },
};

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        הכלים של הצרחן הנבון
      </h1>
      <p className="text-text-secondary mb-10">
        כל הכלים במקום אחד — חינמיים, פשוטים, ובנויים מהחוויה האישית
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div
            key={app.slug}
            className="group rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl" role="img" aria-label={app.nameEn}>
                {app.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text-primary">
                    {app.name}
                  </h2>
                  <StatusBadge
                    status={app.status}
                    label={app.statusLabel}
                    icon={app.statusIcon}
                  />
                </div>
                <p className="text-sm text-text-tertiary font-[family-name:var(--font-dm-sans)]">
                  {app.nameEn}
                </p>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {app.fullDescription}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {app.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-tertiary"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
              >
                פתח את הכלי
                <ExternalLink size={14} />
              </a>
              <a
                href={`/blog/${app.blogSlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
              >
                <BookOpen size={14} />
                קרא את הסיפור
              </a>
            </div>
          </div>
        ))}
      </div>

      <AppsJsonLd />
    </div>
  );
}

function AppsJsonLd() {
  const jsonLd = apps.map((app) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    alternateName: app.nameEn,
    url: app.url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description: app.fullDescription,
    offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
    author: {
      "@type": "Person",
      name: "שמואל דרטבה",
      alternateName: "Samuel Dratwa",
    },
  }));

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </>
  );
}
