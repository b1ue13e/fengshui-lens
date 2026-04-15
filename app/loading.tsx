import { AppShell } from "@/components/shared/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="soft-panel h-52 animate-pulse rounded-[1.8rem]" />
        ))}
      </div>
    </AppShell>
  );
}
