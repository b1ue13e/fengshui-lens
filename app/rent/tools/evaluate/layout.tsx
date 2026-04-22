import type { Metadata } from "next";

import { buildRentalEntryMetadata } from "@/lib/metadata/page-metadata";

export const metadata: Metadata = buildRentalEntryMetadata(
  "完整租房判断",
  "这是青年大学习第一课的完整判断主链。当前先从上海首次租房切入，把通勤、现金流、合同和真实性按步骤核清，再决定值不值得继续谈。",
);

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4 py-6">{children}</div>;
}