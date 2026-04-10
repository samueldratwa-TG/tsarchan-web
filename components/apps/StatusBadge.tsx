import type { AppStatus } from "@/lib/apps-data";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AppStatus;
  label: string;
  icon: string;
}

const statusStyles: Record<AppStatus, string> = {
  live: "bg-status-live/10 text-status-live",
  beta: "bg-status-beta/10 text-status-beta",
  soon: "bg-status-soon/10 text-status-soon",
};

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        statusStyles[status]
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
