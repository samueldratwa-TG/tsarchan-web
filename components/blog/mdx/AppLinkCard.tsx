import { ExternalLink } from "lucide-react";
import { getAppBySlug } from "@/lib/apps-data";

interface AppLinkCardProps {
  app: string;
}

export function AppLinkCard({ app }: AppLinkCardProps) {
  const appData = getAppBySlug(app);
  if (!appData) return null;

  return (
    <a
      href={appData.url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-secondary p-4 hover:shadow-md hover:border-accent/30 transition-all group no-underline"
    >
      <span className="text-3xl" role="img" aria-label={appData.nameEn}>
        {appData.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-text-primary group-hover:text-accent transition-colors">
          {appData.name}
        </div>
        <div className="text-sm text-text-secondary truncate">
          {appData.description}
        </div>
      </div>
      <ExternalLink
        size={18}
        className="shrink-0 text-text-tertiary group-hover:text-accent transition-colors"
      />
    </a>
  );
}
