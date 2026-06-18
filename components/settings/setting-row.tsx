import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingRowProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  chevron?: boolean;
  danger?: boolean;
};

export function SettingRow({ icon: Icon, label, value, chevron = true, danger = false }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          danger ? "bg-destructive/10" : "bg-secondary"
        )}
      >
        <Icon size={15} className={danger ? "text-destructive" : "text-foreground"} />
      </div>
      <span className={cn("flex-1 text-sm font-body", danger ? "text-destructive" : "text-foreground")}>
        {label}
      </span>
      {value ? <span className="text-xs text-muted-foreground font-body">{value}</span> : null}
      {chevron ? <ChevronRight size={16} className="text-muted-foreground" /> : null}
    </div>
  );
}
