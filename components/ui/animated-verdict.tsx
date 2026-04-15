"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedVerdictProps {
  verdict: "rent" | "cautious" | "avoid";
  score?: number;
  className?: string;
}

export function AnimatedVerdict({ verdict, score, className }: AnimatedVerdictProps) {
  // 定义三种判断结果的入场动画
  const verdictVariants = {
    rent: {
      y: [20, 0],
      scale: [0.9, 1],
      opacity: [0, 1],
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
    cautious: {
      x: [-5, 5, -5, 5, 0],
      opacity: [0, 1],
      transition: { duration: 0.5, ease: "easeInOut" as const },
    },
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

  const styles = {
    rent: "border-primary bg-primary/10 text-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    cautious: "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    avoid: "border-destructive bg-destructive/10 text-destructive shadow-[0_0_30px_rgba(239,68,68,0.5)]",
  };

  const labels = {
    rent: "🟢 可以继续了解",
    cautious: "🟡 带着问题再核验",
    avoid: "🔴 先别急着租",
  };

  const descriptions = {
    rent: "整体条件较稳，可以继续核验关键细节",
    cautious: "存在重点疑问，现场再确认后更稳妥",
    avoid: "短板较难低成本补救，建议及时止损",
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
      
      {/* 补充说明 */}
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
          <span className="text-sm opacity-60">判断分数</span>
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
 * 三档判断预览组件（用于展示/调试）
 */
export function VerdictShowcase() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto">
      <h3 className="text-center text-slate-400 text-sm uppercase tracking-wider mb-4">
        租房判断动画预览
      </h3>
      <AnimatedVerdict verdict="rent" score={92} />
      <AnimatedVerdict verdict="cautious" score={65} />
      <AnimatedVerdict verdict="avoid" score={20} />
    </div>
  );
}
