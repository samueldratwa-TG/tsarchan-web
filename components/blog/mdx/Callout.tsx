import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

const styles = {
  info: {
    bg: "bg-accent-light",
    border: "border-accent/20",
    icon: Info,
    iconColor: "text-accent",
  },
  warning: {
    bg: "bg-accent-warm-light",
    border: "border-accent-warm/20",
    icon: AlertTriangle,
    iconColor: "text-accent-warm",
  },
  tip: {
    bg: "bg-status-live/5",
    border: "border-status-live/20",
    icon: Lightbulb,
    iconColor: "text-status-live",
  },
};

export function Callout({ type = "info", children }: CalloutProps) {
  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-xl border p-4",
        style.bg,
        style.border
      )}
    >
      <Icon size={20} className={cn("mt-0.5 shrink-0", style.iconColor)} />
      <div className="text-sm text-text-secondary leading-relaxed [&_a]:text-accent [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
