"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Compass, FileSearch2, Link2, ScanSearch, ShieldCheck } from "lucide-react";
import { ExtractionScanner, ScanButton } from "@/components/ui/extraction-scanner";
import { AnimatedVerdict } from "@/components/ui/animated-verdict";

const DEMO_RESULT = {
  verdict: "cautious" as const,
  score: 72,
};

const SCAN_PRINCIPLES = [
  {
    icon: FileSearch2,
    title: "输入原始链接",
    desc: "系统先读取可公开获取的房源文字与标签。",
  },
  {
    icon: ShieldCheck,
    title: "做保守判断",
    desc: "优先发现难以补救的问题，而不是给出乐观结论。",
  },
  {
    icon: ArrowRight,
    title: "再进入详评",
    desc: "扫描完成后再决定是否打开完整报告与对比页。",
  },
] as const;

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [url, setUrl] = useState("");
  const [scanRunId, setScanRunId] = useState(0);
  const router = useRouter();

  const handleScan = async () => {
    if (!url.trim()) return;

    setScanRunId((prev) => prev + 1);
    setIsScanning(true);
    setShowResult(false);

    await new Promise((resolve) => setTimeout(resolve, 6000));

    setIsScanning(false);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(110,146,124,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(175,111,80,0.14),transparent_24%)]">
      <ExtractionScanner
        key={scanRunId}
        isScanning={isScanning}
        onComplete={() => console.log("扫描完成")}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {!showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <section className="space-y-6 rounded-[32px] border border-stone-300/70 bg-white/82 p-7 shadow-[0_20px_80px_rgba(52,57,53,0.08)] backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                <Compass className="h-4 w-4 text-stone-500" />
                演示态扫描入口
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  先扫一遍房源，再决定要不要继续投入时间。
                </h1>
                <p className="max-w-xl text-base leading-7 text-stone-600">
                  这里保留演示模式扫描体验，强调“读取链接、抽取线索、生成初判”的三段节奏，而不是赛博特效。
                </p>
              </div>

              <div className="relative rounded-[28px] border border-stone-200 bg-stone-50 p-4">
                <textarea
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="粘贴小红书、贝壳、豆瓣或链家房源链接..."
                  className="min-h-[140px] w-full resize-none border-0 bg-transparent p-2 text-base text-stone-900 placeholder:text-stone-400 outline-none"
                />
                <div className="flex items-center justify-between border-t border-stone-200 px-2 pt-3 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    优先读取面积、朝向、标签
                  </span>
                  <span>支持主流租房平台链接</span>
                </div>
              </div>

              <div className="flex justify-start">
                <ScanButton onClick={handleScan} isLoading={isScanning}>
                  <ScanSearch className="h-5 w-5" />
                  开始扫描
                </ScanButton>
              </div>
            </section>

            <aside className="space-y-4 rounded-[32px] border border-stone-300/70 bg-[linear-gradient(180deg,rgba(247,244,239,0.96),rgba(239,234,227,0.92))] p-6 shadow-[0_18px_60px_rgba(68,55,41,0.08)]">
              {SCAN_PRINCIPLES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-stone-900">{title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{desc}</p>
                </div>
              ))}
            </aside>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <AnimatedVerdict verdict={DEMO_RESULT.verdict} score={DEMO_RESULT.score} />

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowResult(false);
                  setUrl("");
                }}
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-stone-700 transition-colors hover:border-stone-500"
              >
                重新扫描
              </button>
              <button
                onClick={() => router.push("/report/demo")}
                className="rounded-full bg-stone-900 px-6 py-3 text-stone-50 transition-opacity hover:opacity-90"
              >
                查看详情
              </button>
            </div>
          </motion.div>
        )}

        {!isScanning && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { step: "01", title: "接入数据", desc: "解析房源链接" },
              { step: "02", title: "测算维度", desc: "分析空间几何" },
              { step: "03", title: "捕获环境", desc: "识别关键风险" },
              { step: "04", title: "生成结论", desc: "输出保守建议" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-stone-200 bg-white/78 p-4">
                <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-stone-400">{item.step}</div>
                <div className="mb-1 text-sm font-semibold text-stone-900">{item.title}</div>
                <div className="text-xs leading-5 text-stone-500">{item.desc}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
