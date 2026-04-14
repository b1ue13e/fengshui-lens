import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaceRisk | 租房前空间风险评估",
  description: "面向租房决策的空间风险评估工具，帮助识别采光、噪音、潮湿等居住隐患并生成可执行建议。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-background font-sans antialiased text-foreground">{children}</body>
    </html>
  );
}
