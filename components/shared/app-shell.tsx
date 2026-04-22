"use client";

import Link from "next/link";
import { Menu, X, Home, House, MapPinned, Search, UserRound, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FloatingToast } from "@/components/shared/floating-toast";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home, match: ["/"] },
  { href: "/rent/tools", label: "租房判断", icon: House, match: ["/rent"] },
  { href: "/survival-plans/start", label: "到沪路线", icon: MapPinned, match: ["/survival-plans"] },
  {
    href: "/resources",
    label: "学习",
    icon: BookOpen,
    match: ["/resources", "/categories", "/paths", "/toolkit", "/simulator", "/scenario"],
  },
  { href: "/search", label: "搜索", icon: Search, match: ["/search"] },
  { href: "/profile", label: "我的", icon: UserRound, match: ["/profile"] },
] as const;

function isActive(pathname: string, matches: readonly string[]) {
  return matches.some((target) => (target === "/" ? pathname === "/" : pathname.startsWith(target)));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
            青年大学习
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, item.match)
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 transition hover:bg-neutral-100 md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="打开导航菜单"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-neutral-200 bg-white md:hidden">
            <div className="mx-auto max-w-5xl space-y-1 px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <footer className="mt-12 border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-500 md:flex-row">
          <p>青年大学习 — 现实决策训练系统</p>
          <p>当前版本专注：上海首次租房决策与落地承接</p>
        </div>
      </footer>

      <FloatingToast />
    </div>
  );
}
