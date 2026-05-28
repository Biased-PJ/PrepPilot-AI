import { type LucideIcon } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, accent, sub,
}: {
  label: string; value: React.ReactNode; icon: LucideIcon;
  accent?: string; sub?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition"
        style={{ background: accent || "var(--primary)" }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-border"
          style={{ background: `color-mix(in oklch, ${accent || "var(--primary)"} 18%, transparent)` }}>
          <Icon className="h-4 w-4" style={{ color: accent || "var(--primary)" }} />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-muted/40 animate-shimmer ${className}`} />;
}

export function EmptyState({ title, desc, icon: Icon, action }: { title: string; desc?: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      {Icon && (
        <div className="h-12 w-12 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-hero)" }}>
          <Icon className="h-6 w-6 text-background" />
        </div>
      )}
      <h3 className="font-semibold">{title}</h3>
      {desc && <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}