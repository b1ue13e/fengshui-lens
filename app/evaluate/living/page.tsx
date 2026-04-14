"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Target, Wallet, Wrench } from "lucide-react";
import { submitEvaluation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  FormSection,
  NotePanel,
  PageIntro,
  ToggleCard,
} from "@/components/evaluate/form-primitives";
import {
  BUDGET_RANGES,
  BUDGET_RANGE_LABELS,
  PRIMARY_GOALS,
  PRIMARY_GOAL_LABELS,
  type BudgetRange,
  type PrimaryGoal,
} from "@/types";

const goalOptions = PRIMARY_GOALS.map((value) => ({
  value,
  ...PRIMARY_GOAL_LABELS[value],
}));

const budgetOptions = BUDGET_RANGES.map((value) => ({
  value,
  label: BUDGET_RANGE_LABELS[value],
}));

export default function LivingNeedsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    primaryGoal: "" as PrimaryGoal | "",
    monthlyBudget: "" as BudgetRange | "",
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const basicInfo = JSON.parse(sessionStorage.getItem("basicInfo") || "{}");
      const spaceInfo = JSON.parse(sessionStorage.getItem("spaceInfo") || "{}");

      if (!basicInfo.layoutType || !basicInfo.areaSqm) {
        setError("缺少基础信息，请返回第一步重新填写。");
        setIsSubmitting(false);
        return;
      }

      if (!formData.primaryGoal || !formData.monthlyBudget) {
        setError("请选择居住目标和预算范围。");
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
    } catch (err) {
      if (!(err instanceof Error)) {
        setError("提交失败，请稍后再试。");
        setIsSubmitting(false);
        return;
      }

      console.error("[Submit] Error:", err);
      setError(`提交失败：${err.message || "未知错误，请稍后再试。"}`);
      setIsSubmitting(false);
    }
  };

  const isLockedMode =
    !formData.allowsLightRenovation &&
    !formData.allowsFurnitureMove &&
    !formData.allowsSoftImprovements;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageIntro
        step="STEP 3 / 3"
        title="最后补上你的取舍标准。"
        description="同一套房，对不同租客的结论可能完全不同。这里会告诉系统你更在意什么、预算在哪个区间，以及你能接受哪些补救动作。"
        icon={Target}
        chips={["约 1 分钟", "决定权重", "生成最终报告"]}
      />

      <FormSection
        title="居住目标"
        description="先告诉系统你最在意的核心目标，报告会据此调整风险排序和建议重点。"
        icon={Target}
      >
        <div className="space-y-3">
          {goalOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={formData.primaryGoal === opt.value}
              onClick={() => setFormData({ ...formData, primaryGoal: opt.value })}
              title={opt.label}
              description={opt.desc}
              className="min-h-0"
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        title="预算范围"
        description="预算会影响建议的语气和可执行性，例如是优先保守筛房，还是接受一定缺点换取性价比。"
        icon={Wallet}
      >
        <div className="space-y-2">
          {budgetOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={formData.monthlyBudget === opt.value}
              onClick={() => setFormData({ ...formData, monthlyBudget: opt.value })}
              title={opt.label}
              className="min-h-0"
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        title="你能接受的调整方式"
        description="报告会优先推荐你能接受的补救动作。如果完全不能改动，系统会更偏向保守筛选。"
        icon={Wrench}
      >
        <div className="space-y-3">
          <ToggleCard
            checked={formData.allowsLightRenovation}
            onChange={(checked) =>
              setFormData({ ...formData, allowsLightRenovation: checked })
            }
            title="接受轻改造"
            description="例如贴隔热膜、加密封条、打孔安装置物架等。"
          />
          <ToggleCard
            checked={formData.allowsFurnitureMove}
            onChange={(checked) =>
              setFormData({ ...formData, allowsFurnitureMove: checked })
            }
            title="接受移动家具"
            description="例如调整床、书桌、柜子等大型家具位置。"
          />
          <ToggleCard
            checked={formData.allowsSoftImprovements}
            onChange={(checked) =>
              setFormData({ ...formData, allowsSoftImprovements: checked })
            }
            title="接受增加软装"
            description="例如遮光帘、地毯、屏风、除湿机和收纳件。"
          />
        </div>

        {isLockedMode ? (
          <NotePanel title="当前是完全不改动模式" tone="warning">
            这样系统会更倾向于直接判断是否值得租，而不是推荐补救方案。
          </NotePanel>
        ) : null}
      </FormSection>

      {error ? (
        <div className="rounded-[1.35rem] border border-destructive/20 bg-destructive/8 px-4 py-4 text-sm text-destructive">
          <strong className="mr-1">提交失败：</strong>
          {error}
        </div>
      ) : null}

      <NotePanel title="提交后会直接生成报告">
        报告会先给出结论摘要，再展开风险依据、可补救空间和沟通建议。
      </NotePanel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-full border-border bg-background/80"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button
          type="submit"
          className="h-12 flex-1 rounded-full text-base"
          disabled={!formData.primaryGoal || !formData.monthlyBudget || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在生成报告...
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
