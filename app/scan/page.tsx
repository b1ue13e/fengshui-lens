"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExtractionScanner, ScanButton } from "@/components/ui/extraction-scanner";
import { AnimatedVerdict } from "@/components/ui/animated-verdict";

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleScan = async () => {
    if (!url.trim()) return;
    
    setIsScanning(true);
    setShowResult(false);
    
    // 模拟 6 秒的堪舆过程
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    setIsScanning(false);
    setShowResult(true);
  };

  const mockVerdicts = ["rent", "cautious", "avoid"] as const;
  const randomVerdict = mockVerdicts[Math.floor(Math.random() * mockVerdicts.length)];
  const randomScore = Math.floor(Math.random() * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* 赛博罗盘扫描仪 */}
      <ExtractionScanner 
        isScanning={isScanning} 
        onComplete={() => console.log("扫描完成")}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient-cyber">赛博罗盘</span> 扫描仪
          </h1>
          <p className="text-muted-foreground">
            输入房源链接，让风水镜洞察空间地脉
          </p>
        </div>

        {/* 输入区域 */}
        {!showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <textarea
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="粘贴小红书、贝壳找房或豆瓣租房链接..."
                className="w-full min-h-[120px] bg-slate-900/50 border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
              {/* 装饰边角 */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-primary/50" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-primary/50" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-primary/50" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-primary/50" />
            </div>

            {/* 提示文字 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>支持小红书、贝壳、豆瓣、链家等平台</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* 扫描按钮 */}
            <div className="flex justify-center">
              <ScanButton onClick={handleScan} isLoading={isScanning}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                开启风水堪舆
              </ScanButton>
            </div>
          </motion.div>
        )}

        {/* 结果展示 */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <AnimatedVerdict 
              verdict={randomVerdict} 
              score={randomScore} 
            />
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowResult(false);
                  setUrl("");
                }}
                className="px-6 py-3 rounded-lg border border-border hover:border-primary transition-colors"
              >
                重新扫描
              </button>
              <button
                onClick={() => router.push('/report/demo')}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                查看详情
              </button>
            </div>
          </motion.div>
        )}

        {/* 使用说明 */}
        {!isScanning && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-4 gap-4 text-center"
          >
            {[
              { step: "01", title: "接入地脉", desc: "解析房源链接" },
              { step: "02", title: "测算维度", desc: "分析空间几何" },
              { step: "03", title: "捕获气场", desc: "检测环境因素" },
              { step: "04", title: "生成矩阵", desc: "纯函数引擎判决" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-900/30 border border-border/50">
                <div className="text-primary/60 text-xs font-mono mb-2">{item.step}</div>
                <div className="text-sm font-semibold mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
