import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpaceRisk | 租房前空间风险决策器",
  description: "基于居住科学的租房风险评估工具，帮你识别采光、噪音、潮湿等隐患，生成低成本改造方案和沟通话术。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.variable} font-sans antialiased bg-stone-50`}>
        {children}
      </body>
    </html>
  );
}
