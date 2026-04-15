import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <AppShell>
      <EmptyState
        title="这页内容暂时没找到"
        description="可能是链接写错了，也可能这个场景还没整理进来。先回首页看看其他高频内容。"
        actionLabel="回首页"
        actionHref="/"
      />
    </AppShell>
  );
}
