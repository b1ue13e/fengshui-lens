"use client";

import Link from "next/link";
import { AlertCircle, BookOpen, Compass, Home, MessagesSquare, Search, UserRound, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";

import { FloatingToast } from "@/components/shared/floating-toast";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "沙盒", icon: Home },
  { href: "/categories", label: "资源库", icon: Compass },
  { href: "/paths", label: "路线", icon: BookOpen },
  { href: "/toolkit", label: "工具", icon: Wrench },
  { href: "/simulator", label: "训练场", icon: MessagesSquare },
  { href: "/profile", label: "我的", icon: UserRound },
];

function matchesPath(currentPath: string, target: string) {
  return target === "/" ? currentPath === "/" : currentPath.startsWith(target);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,140,92,0.16),transparent_26%),radial-gradient(circle_at_78%_12%,rgba(101,164,145,0.17),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(246,205,122,0.12),transparent_24%)]" />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-primary text-sm font-semibold text-primary-foreground shadow-[0_14px_22px_rgba(215,104,78,0.2)]">
              沪
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Social Sandbox</p>
              <p className="text-base font-semibold text-foreground">上海社会生存沙盒</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/search">
              <Button variant="outline" size="icon-sm" className="rounded-full border-white/60 bg-background/70">
                <Search className="size-4" />
              </Button>
            </Link>
            <Link href="/scenario/call-police">
              <Button variant="destructive" size="sm" className="rounded-full px-3">
                <AlertCircle className="size-4" />
                紧急卡
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-5 md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 px-2 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
          {navItems.map((item) => {
            const active = matchesPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[0.72rem] text-muted-foreground transition-colors",
                  active && "bg-card text-foreground shadow-[0_10px_20px_rgba(35,42,33,0.08)]"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <FloatingToast />
    </div>
  );
}
