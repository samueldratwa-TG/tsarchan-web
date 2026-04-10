import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";
import { apps } from "@/lib/apps-data";
import { StatusBadge } from "@/components/apps/StatusBadge";

export function AppGrid() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 mb-16">
      <h2 className="text-2xl font-bold text-text-primary mb-8">
        <span className="border-b-2 border-accent pb-1">הכלים שלי</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {apps.map((app) => (
          <div
            key={app.slug}
            className="group rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl" role="img" aria-label={app.nameEn}>
                {app.icon}
              </span>
              <StatusBadge status={app.status} label={app.statusLabel} icon={app.statusIcon} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              {app.name}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {app.description}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
              >
                פתח
                <ExternalLink size={14} />
              </a>
              <Link
                href={`/blog/${app.blogSlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
              >
                <BookOpen size={14} />
                קרא עוד
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
