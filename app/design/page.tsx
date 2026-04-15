"use client";

import { assertInternalPageAccess } from "@/lib/internal-access";
import { VerdictShowcase } from "@/components/ui/animated-verdict";

export default function DesignPage() {
  assertInternalPageAccess();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="text-gradient-cyber">租房判断卡</span> 动效预览
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          青年大学习 · 租房工具专区三档判定动画
        </p>
        
        <VerdictShowcase />
        
        <div className="mt-16 max-w-2xl mx-auto space-y-4 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">动画说明</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-primary font-bold mb-2">可以继续了解</div>
              <p>轻快上浮，用来表达整体条件较稳、可以继续核验细节。</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="text-yellow-500 font-bold mb-2">带着问题再核验</div>
              <p>轻微摇摆，用来提示存在重点疑问，需要现场复核。</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-destructive font-bold mb-2">先别急着租</div>
              <p>更重的下坠和警示色，强调短板较难低成本补救。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
