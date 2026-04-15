"use client";

import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <div className="soft-panel mx-auto max-w-xl rounded-[2rem] p-6">
        <p className="sticker-label">出了点问题</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">这一页暂时没加载出来</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {error.message || "你可以先重试一次，如果还是不行，再回首页继续看别的场景。"}
        </p>
        <div className="mt-5 flex gap-3">
          <Button onClick={reset}>重试</Button>
          <Link href="/">
            <Button variant="outline">回首页</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
