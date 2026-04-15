import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "上海社会生存沙盒",
    template: "%s | 上海社会生存沙盒",
  },
  description:
    "面向外地应届生的上海社会生存沙盒，输出带官方来源的到沪落脚路线图，并保留资源库、训练场与专项工具。",
  applicationName: "上海社会生存沙盒",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "上海社会生存沙盒",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
