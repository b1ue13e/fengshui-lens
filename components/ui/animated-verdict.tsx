"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedVerdictProps {
  verdict: "rent" | "cautious" | "avoid";
  score?: number;
  className?: string;
}

export function AnimatedVerdict({ verdict, score, className }: AnimatedVerdictProps) {
  // 核心拆解 1：定义风水物理学 (Variants)
  const verdictVariants = {
    // 升腾与轻盈 - 吉
    rent: {
      y: [20, 0],
      scale: [0.9, 1],
      opacity: [0, 1],
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
    // 沉闷与微颤 - 平/凶带吉
    cautious: {
      x: [-5, 5, -5, 5, 0],
      opacity: [0, 1],
      transition: { duration: 0.5, ease: "easeInOut" as const },
    },
    // 沉重坠落与爆震 - 大凶 (Shake effect)
    avoid: {
      scale: [1.2, 0.95, 1.05, 1],
      y: [-50, 0],
      opacity: [0, 1],
      filter: [
        "drop-shadow(0 0 0px rgba(239,68,68,0))", 
        "drop-shadow(0 0 40px rgba(239,68,68,0.8))"
      ],
      transition: { 
        duration: 0.6, 
        times: [0, 0.4, 0.7, 1],
        ease: "circOut" as const
      },
    },
  };

  // 核心拆解 2：样式基因重组
  const styles = {
    rent: "border-primary bg-primary/10 text-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    cautious: "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    avoid: "border-destructive bg-destructive/10 text-destructive shadow-[0_0_30px_rgba(239,68,68,0.5)]",
  };

  const labels = {
    rent: "🟢 宜居 (Rent)",
    cautious: "🟡 观望 (Cautious)",
    avoid: "🔴 避坑 (Avoid)",
  };

  const descriptions = {
    rent: "气场通畅，龙脉汇聚",
    cautious: "风云变幻，需细斟酌",
    avoid: "煞气冲天，速速远离",
  };

  return (
    <motion.div
      variants={verdictVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={verdict}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 p-8 text-center backdrop-blur-md",
        styles[verdict],
        className
      )}
    >
      {/* 背景脉冲光环 */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-xl"
        animate={{
          boxShadow: [
            "inset 0 0 20px currentColor",
            "inset 0 0 60px currentColor",
            "inset 0 0 20px currentColor",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ opacity: 0.1 }}
      />

      {/* 主标题 */}
      <motion.h2 
        className="text-4xl font-bold tracking-widest text-glow"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {labels[verdict]}
      </motion.h2>
      
      {/* 风水批语 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-lg opacity-80 italic"
      >
        {descriptions[verdict]}
      </motion.p>
      
      {/* 分数显示 */}
      {score !== undefined && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-current/30"
        >
          <span className="text-sm opacity-60">契合度</span>
          <span className="text-2xl font-mono font-bold">{score}</span>
          <span className="text-sm opacity-60">/100</span>
        </motion.div>
      )}

      {/* 赛博扫描线特效 */}
      <motion.div 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-current to-transparent"
        style={{ opacity: 0.05 }}
        animate={{ y: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
      />

      {/* 角落装饰符文 */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-current/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-current/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-current/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-current/50" />
    </motion.div>
  );
}

/**
 * 三档判决预览组件（用于展示/调试）
 */
export function VerdictShowcase() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto">
      <h3 className="text-center text-slate-400 text-sm uppercase tracking-wider mb-4">
        风水判决动画预览
      </h3>
      <AnimatedVerdict verdict="rent" score={92} />
      <AnimatedVerdict verdict="cautious" score={65} />
      <AnimatedVerdict verdict="avoid" score={20} />
    </div>
  );
}
