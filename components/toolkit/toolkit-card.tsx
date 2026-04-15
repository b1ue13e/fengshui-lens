"use client";

import { Download, Star } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import type { ToolkitResource } from "@/lib/types/young-study";
import { useAppStore } from "@/lib/store/app-store";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function ToolkitCard({ resource }: { resource: ToolkitResource }) {
  const saved = useAppStore((state) => state.savedToolkits.includes(resource.slug));
  const toggleToolkitSave = useAppStore((state) => state.toggleToolkitSave);
  const pushToast = useAppStore((state) => state.pushToast);

  return (
    <article className="soft-panel rounded-[1.8rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="sticker-label">拿来就能用</div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{resource.title}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{resource.summary}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/60 bg-background/70 p-2 text-muted-foreground"
          onClick={() => {
            toggleToolkitSave(resource.slug);
            pushToast(saved ? "已取消收藏" : "已加入收藏", resource.title);
          }}
        >
          <Star className={`size-4 ${saved ? "fill-current text-primary" : ""}`} />
        </button>
      </div>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/82">
        {resource.items.map((item) => (
          <li key={item.id} className="rounded-2xl bg-background/65 px-3 py-2">
            {item.content}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton value={resource.copyText} label="复制模板" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            downloadText(resource.downloadName, resource.copyText);
            pushToast("已下载", resource.downloadName);
          }}
        >
          <Download className="size-4" />
          下载
        </Button>
      </div>
    </article>
  );
}
