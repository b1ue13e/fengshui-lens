"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "首页", href: "/" },
  { label: "空间诊断", href: "/analyze" },
  { label: "示例报告", href: "/report" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-stone-200/60" />
      
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-subtle transition-all duration-300 group-hover:shadow-soft group-hover:scale-105">
            <Camera className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-stone-900 leading-none">
              FengShui Lens
            </span>
            <span className="text-[10px] font-medium text-stone-500 tracking-wide mt-0.5">
              空间气场诊断器
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive
                    ? "text-stone-900"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-stone-100 rounded-lg" />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/analyze">
            <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-5 h-9 text-sm font-medium shadow-subtle hover:shadow-soft transition-all duration-200 btn-press">
              开始诊断
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
            >
              <Menu className="h-5 w-5 text-stone-600" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 bg-white border-l border-stone-200/60 p-0"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                    <Camera className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-stone-900">
                    FengShui Lens
                  </span>
                </Link>
              </div>
              
              {/* Mobile Nav Items */}
              <nav className="flex-1 p-6">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                          isActive
                            ? "text-stone-900 bg-stone-100"
                            : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              {/* Mobile CTA */}
              <div className="p-6 border-t border-stone-100">
                <Link href="/analyze" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl h-11 font-medium">
                    开始诊断
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
