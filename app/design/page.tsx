"use client";

import { VerdictShowcase } from "@/components/ui/animated-verdict";

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="text-gradient-cyber">赛博风水</span> 设计系统
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          Cyber-FengShui Design System · 三档判决物理动画
        </p>
        
        <VerdictShowcase />
        
        <div className="mt-16 max-w-2xl mx-auto space-y-4 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">动画说明</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-primary font-bold mb-2">Rent (吉)</div>
              <p>Spring 弹性升腾，暗示生机勃勃</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="text-yellow-500 font-bold mb-2">Cautious (平)</div>
              <p>水平微颤，暗示风云变幻需警惕</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-destructive font-bold mb-2">Avoid (凶)</div>
              <p>沉重坠落 + 红光爆发，煞气审判</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
