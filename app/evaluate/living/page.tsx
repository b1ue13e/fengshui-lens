"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Loader2, Check, Target, Wallet, Wrench } from "lucide-react";
import { 
  PRIMARY_GOALS,
  BUDGET_RANGES,
  PRIMARY_GOAL_LABELS,
  BUDGET_RANGE_LABELS,
  type PrimaryGoal,
  type BudgetRange,
} from "@/types";
import { submitEvaluation } from "@/app/actions";

// 选项卡片组件
function OptionCard({ 
  selected, 
  onClick, 
  children,
  className = ""
}: { 
  selected: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-200 bg-white hover:border-stone-300 text-stone-900"
      } ${className}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      {children}
    </button>
  );
}

// Checkbox 卡片组件
function CheckboxCard({ 
  checked, 
  onChange, 
  title, 
  description 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  title: string;
  description?: string;
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      checked ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:bg-stone-50'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 mt-0.5"
      />
      <div className="flex-1">
        <div className="font-medium text-stone-900 text-sm">{title}</div>
        {description && <div className="text-xs text-stone-500 mt-1">{description}</div>}
      </div>
    </label>
  );
}

const goalOptions = PRIMARY_GOALS.map(value => ({
  value,
  ...PRIMARY_GOAL_LABELS[value],
}));

const budgetOptions = BUDGET_RANGES.map(value => ({
  value,
  label: BUDGET_RANGE_LABELS[value],
}));

export default function LivingNeedsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    primaryGoal: "" as PrimaryGoal | "",
    monthlyBudget: "" as BudgetRange | "",
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const basicInfo = JSON.parse(sessionStorage.getItem("basicInfo") || "{}");
      const spaceInfo = JSON.parse(sessionStorage.getItem("spaceInfo") || "{}");
      
      // 验证必要数据
      if (!basicInfo.layoutType || !basicInfo.areaSqm) {
        setError("缺少基础信息，请返回第一步重新填写");
        setIsSubmitting(false);
        return;
      }

      const fullData = {
        ...basicInfo,
        ...spaceInfo,
        ...formData,
        areaSqm: parseInt(basicInfo.areaSqm) || 0,
        totalFloors: parseInt(basicInfo.totalFloors) || 0,
        dampSigns: spaceInfo.dampSigns || [],
      };

      await submitEvaluation(fullData);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "提交失败，请检查网络连接或联系管理员");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
          <Target className="h-4 w-4" />
          <span>步骤 3/3</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">居住需求</h1>
        <p className="text-stone-600">了解你的目标和约束，生成针对性建议</p>
      </div>

      {/* 居住目标 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Target className="h-4 w-4" />
          居住目标
        </h2>
        <p className="text-sm text-stone-600">选择你的主要居住目标，我们会据此调整评分权重</p>
        
        <div className="space-y-3">
          {goalOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={formData.primaryGoal === opt.value}
              onClick={() => setFormData({ ...formData, primaryGoal: opt.value })}
              className="w-full"
            >
              <div className="font-medium text-base mb-1">{opt.label}</div>
              <div className={`text-sm ${formData.primaryGoal === opt.value ? "text-stone-300" : "text-stone-500"}`}>
                {opt.desc}
              </div>
            </OptionCard>
          ))}
        </div>
      </section>

      {/* 预算范围 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          预算范围
        </h2>
        
        <div className="space-y-2">
          {budgetOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={formData.monthlyBudget === opt.value}
              onClick={() => setFormData({ ...formData, monthlyBudget: opt.value })}
              className="w-full py-3"
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      {/* 改造意愿 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          改造意愿
        </h2>
        <p className="text-sm text-stone-600">
          评估后会推荐低成本改造方案，请确认你是否接受以下类型的改善
        </p>

        <div className="space-y-3">
          <CheckboxCard
            checked={formData.allowsLightRenovation}
            onChange={(checked) => setFormData({ ...formData, allowsLightRenovation: checked })}
            title="轻改造"
            description="如贴隔热膜、安装密封条、打孔安装置物架等"
          />

          <CheckboxCard
            checked={formData.allowsFurnitureMove}
            onChange={(checked) => setFormData({ ...formData, allowsFurnitureMove: checked })}
            title="移动家具"
            description="调整床、书桌、柜子等大型家具的位置"
          />

          <CheckboxCard
            checked={formData.allowsSoftImprovements}
            onChange={(checked) => setFormData({ ...formData, allowsSoftImprovements: checked })}
            title="增加软装"
            description="添置遮光帘、地毯、屏风、除湿机等"
          />
        </div>

        {(!formData.allowsLightRenovation && !formData.allowsFurnitureMove && !formData.allowsSoftImprovements) && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>提示：</strong>如果不接受任何改造，评估将仅基于房源现有条件给出建议。
            </p>
          </div>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <strong>错误：</strong>{error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 h-12" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button 
          type="submit" 
          className="flex-1 h-12 text-base"
          disabled={!formData.primaryGoal || !formData.monthlyBudget || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              生成评估报告
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
