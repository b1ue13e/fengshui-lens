"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  "正在接入地脉网络 (Connecting Leylines)...",
  "测算空间几何维度 (Calculating Spatial Dimensions)...",
  "捕获环境气场波动 (Capturing Energy Fluctuations)...",
  "生成风水堪舆矩阵 (Generating FengShui Matrix)...",
];

interface ExtractionScannerProps {
  isScanning: boolean;
  onComplete?: () => void;
}

export function ExtractionScanner({ isScanning, onComplete }: ExtractionScannerProps) {
  const [currentPhase, setCurrentPhase] = useState(0);

  // 核心拆解 1：假装在努力工作的状态机
  useEffect(() => {
    if (!isScanning) {
      setCurrentPhase(0);
      return;
    }

    // 每 1.8 秒切换一次施法状态
    const interval = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = prev < PHASES.length - 1 ? prev + 1 : prev;
        if (next === PHASES.length - 1 && onComplete) {
          // 最后阶段可以触发完成回调
          setTimeout(onComplete, 1500);
        }
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isScanning, onComplete]);

  return (
    // 核心拆解 2：AnimatePresence 确保全屏遮罩的平滑进出
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80"
        >
          {/* 核心罗盘区域 */}
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* 外层八卦阵旋转光环 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40"
            />
            
            {/* 中层反向旋转 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="absolute inset-3 rounded-full border border-primary/30"
            />

            {/* 内层脉冲光环 */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-6 rounded-full bg-primary/10"
            />
            
            {/* 核心扫描线：从上到下反复扫描的激光器 */}
            <motion.div
              animate={{ y: ["-80px", "80px", "-80px"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute h-0.5 w-48 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(52,211,153,1)]"
            />

            {/* 中心的赛博符文 */}
            <div className="relative">
              <motion.div
                animate={{ 
                  textShadow: [
                    "0 0 10px rgba(52,211,153,0.5)",
                    "0 0 30px rgba(52,211,153,1)",
                    "0 0 10px rgba(52,211,153,0.5)",
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl font-mono text-primary tracking-widest font-bold"
              >
                乾坤
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -bottom-2 left-0 right-0 text-center text-xs text-primary/60 font-mono"
              >
                SCANNING
              </motion.div>
            </div>
          </div>

          {/* 状态文本区 */}
          <div className="mt-12 h-20 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhase}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="font-mono text-lg tracking-widest text-primary"
              >
                {PHASES[currentPhase]}
              </motion.p>
            </AnimatePresence>

            {/* 阶段指示器 */}
            <div className="mt-3 flex justify-center gap-2">
              {PHASES.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-1.5 w-8 rounded-full"
                  animate={{
                    backgroundColor: idx <= currentPhase ? "#10b981" : "#374151",
                    scale: idx === currentPhase ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* 赛博风水进度条 */}
            <div className="mt-6 h-1.5 w-72 overflow-hidden rounded-full bg-primary/20">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentPhase + 1) / PHASES.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
            
            {/* 进度百分比 */}
            <motion.div 
              className="mt-2 text-sm font-mono text-primary/60"
              key={currentPhase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.round(((currentPhase + 1) / PHASES.length) * 100)}%
            </motion.div>
          </div>

          {/* 底部装饰符文 */}
          <motion.div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-mono"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            [ 赛博风水镜 v1.2.0 · 纯函数引擎驱动 ]
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 简化版扫描按钮（用于触发）
 */
export function ScanButton({ 
  onClick, 
  isLoading,
  children 
}: { 
  onClick: () => void; 
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50"
    >
      {/* 按钮内的扫描线动画 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
            />
            堪舆中...
          </>
        ) : (
          <>
            {children}
          </>
        )}
      </span>
    </motion.button>
  );
}
