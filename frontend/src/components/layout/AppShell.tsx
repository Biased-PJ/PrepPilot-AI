import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Code2, BarChart3, Sparkles, Trophy, User, Settings,
  Plug, LogOut, Search, Bell, Menu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/problems", label: "Problems", icon: Code2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/recommendations", label: "AI Coach", icon: Sparkles },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-border bg-sidebar transition-transform
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="font-bold">PrepPilot<span className="gradient-text"> AI</span></span>
          </Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition group
                  ${active
                    ? "bg-sidebar-accent text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"}`}>
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full shrink-0" style={{ background: "var(--gradient-hero)" }} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.name || user?.email?.split("@")[0]}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <button onClick={logout} className="p-1.5 rounded hover:bg-sidebar-accent" title="Sign out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 backdrop-blur-xl bg-background/60 border-b border-border">
          <div className="h-full px-4 lg:px-8 flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
            <button onClick={() => setCmdOpen(true)}
              className="flex-1 max-w-md flex items-center gap-2 px-3 h-9 rounded-lg glass text-sm text-muted-foreground hover:text-foreground transition">
              <Search className="h-4 w-4" />
              <span>Search problems, topics…</span>
              <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 relative">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]" />
          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} onNav={(to) => { navigate({ to }); setCmdOpen(false); }} />}
    </div>
  );
}

function CommandPalette({ onClose, onNav }: { onClose: () => void; onNav: (to: string) => void }) {
  const [q, setQ] = useState("");
  const items = nav.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32 px-4" onClick={onClose}>
      <div className="w-full max-w-lg glass-strong rounded-2xl overflow-hidden card-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to…"
            className="border-0 bg-transparent focus-visible:ring-0 px-0" />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">esc</kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {items.map((i) => (
            <button key={i.to} onClick={() => onNav(i.to)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-left">
              <i.icon className="h-4 w-4 text-primary" /> {i.label}
            </button>
          ))}
          {!items.length && <div className="p-6 text-sm text-muted-foreground text-center">No matches</div>}
        </div>
      </div>
    </div>
  );
}