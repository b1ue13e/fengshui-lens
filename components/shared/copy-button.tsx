"use client";

import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";

export function CopyButton({
  value,
  label = "复制",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const pushToast = useAppStore((state) => state.pushToast);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        pushToast("已复制", "你可以直接粘贴出去用了。");
      }}
    >
      <Copy className="size-4" />
      {label}
    </Button>
  );
}
