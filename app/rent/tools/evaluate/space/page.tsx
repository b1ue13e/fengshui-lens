"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Sun, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CoachTip,
  ChoiceCard,
  FormSection,
  NotePanel,
  PageIntro,
  ToggleCard,
} from "@/components/evaluate/form-primitives";
import {
  BATHROOM_POSITIONS,
  BATHROOM_POSITION_LABELS,
  BED_POSITIONS,
  BED_POSITION_LABELS,
  DESK_POSITIONS,
  DESK_POSITION_LABELS,
  KITCHEN_TYPES,
  KITCHEN_TYPE_LABELS,
  UNIT_POSITIONS,
  UNIT_POSITION_LABELS,
  VENTILATION_TYPES,
  VENTILATION_LABELS,
  WINDOW_EXPOSURES,
  WINDOW_EXPOSURE_LABELS,
  type BathroomPosition,
  type BedPosition,
  type DeskPosition,
  type KitchenType,
  type UnitPosition,
  type Ventilation,
  type WindowExposure,
} from "@/lib/rent-tools/types";

type RoommateSituation = "couple" | "single" | "friends" | "strangers";

const windowOptions = WINDOW_EXPOSURES.map((value) => ({
  value,
  label: WINDOW_EXPOSURE_LABELS[value],
}));

const kitchenOptions = KITCHEN_TYPES.map((value) => ({
  value,
  label: KITCHEN_TYPE_LABELS[value],
}));

const bathroomOptions = BATHROOM_POSITIONS.map((value) => ({
  value,
  label: BATHROOM_POSITION_LABELS[value],
}));

const bedOptions = BED_POSITIONS.map((value) => ({
  value,
  label: BED_POSITION_LABELS[value],
}));

const deskOptions = DESK_POSITIONS.map((value) => ({
  value,
  label: DESK_POSITION_LABELS[value],
}));

const ventilationOptions = VENTILATION_TYPES.map((value) => ({
  value,
  label: VENTILATION_LABELS[value],
}));

const unitPositionOptions = UNIT_POSITIONS.map((value) => ({
  value,
  label: UNIT_POSITION_LABELS[value],
}));

const dampOptions = [
  { id: "condensation", label: "窗户或墙面有冷凝水" },
  { id: "mold_smell", label: "能闻到霉味或闷潮味" },
  { id: "wall_damp", label: "墙面返潮、起泡或发霉" },
];

const roommateOptions: { value: RoommateSituation; label: string }[] = [
  { value: "couple", label: "伴侣或夫妻" },
  { value: "friends", label: "朋友合租" },
  { value: "strangers", label: "陌生室友" },
  { value: "single", label: "独立整租" },
];

export default function SpaceDetailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hasWestFacingWindow: false,
    windowExposure: "full" as WindowExposure,
    facesMainRoad: false,
    nearElevator: false,
    unitPosition: "middle" as UnitPosition,
    hasBalcony: false,
    kitchenType: "" as KitchenType | "",
    bathroomPosition: "" as BathroomPosition | "",
    bedPosition: "" as BedPosition | "",
    deskPosition: "" as DeskPosition | "",
    ventilation: "" as Ventilation | "",
    dampSigns: [] as string[],
    isShared: false,
    roommateSituation: "" as RoommateSituation | "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const existing = sessionStorage.getItem("spaceInfo");
    const merged = existing ? { ...JSON.parse(existing), ...formData } : formData;
    sessionStorage.setItem("spaceInfo", JSON.stringify(merged));
    router.push("/rent/tools/evaluate/living");
  };

  const toggleDampSign = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dampSigns: prev.dampSigns.includes(id)
        ? prev.dampSigns.filter((sign) => sign !== id)
        : [...prev.dampSigns, id],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageIntro
        step="STEP 2 / 3"
        title="把现场最容易踩坑的细节补进去。"
        description="第一次看房不知道该看什么时，就按这一页逐项过。哪怕你只知道大概情况，也能先把明显风险筛出来。"
        icon={Sun}
        chips={["约 1 分钟", "按项排查", "支持不完全信息"]}
      />

      <CoachTip
        title="这一页像看房清单，建议从难补救的问题先看"
        items={[
          "优先看噪声、采光、潮湿这些住进去后最难补救的问题。",
          "如果你现场拿不准，就按更保守的一档填写，后面再调整比先忽略更稳。",
        ]}
      />

      <FormSection
        title="采光与日照"
        description="先判断卧室和主要活动区域会不会过热、过暗。新手看房时，西晒和遮挡最容易被忽略。"
        icon={Sun}
      >
        <ToggleCard
          checked={formData.hasWestFacingWindow}
          onChange={(checked) => setFormData({ ...formData, hasWestFacingWindow: checked })}
          title="卧室或主要活动区有明显西晒"
          description="下午直晒更容易导致室内过热，夏天会明显影响体感和空调成本。"
        />

        <div className="space-y-2">
          <Label className="text-foreground">窗外采光情况</Label>
          <div className="space-y-2">
            {windowOptions.map((opt) => (
              <ToggleCard
                key={opt.value}
                type="radio"
                name="windowExposure"
                checked={formData.windowExposure === opt.value}
                onChange={() => setFormData({ ...formData, windowExposure: opt.value })}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="噪声与外部干扰"
        description="这一部分主要识别睡眠和专注的干扰源，尤其是临街、靠电梯和边角位。"
        icon={Wind}
      >
        <div className="space-y-3">
          <ToggleCard
            checked={formData.facesMainRoad}
            onChange={(checked) => setFormData({ ...formData, facesMainRoad: checked })}
            title="卧室或客厅明显临主干道"
            description="持续车流噪声会更影响休息，尤其是夜间通风时。"
          />
          <ToggleCard
            checked={formData.nearElevator}
            onChange={(checked) => setFormData({ ...formData, nearElevator: checked })}
            title="房间靠近电梯井或电梯厅"
            description="高频开关门和设备运行声，通常比看房时更难被一次性察觉。"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">户型所在位置</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {unitPositionOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.unitPosition === opt.value}
                onClick={() => setFormData({ ...formData, unitPosition: opt.value })}
                title={opt.label}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="户型结构"
        description="厨房、卫生间和阳台位置决定了气味、潮湿和生活动线，往往比装修风格更影响你住进去后的感受。"
        icon={Building2}
      >
        <ToggleCard
          checked={formData.hasBalcony}
          onChange={(checked) => setFormData({ ...formData, hasBalcony: checked })}
          title="有独立阳台"
          description="会影响晾晒、通风和部分居住舒适度判断。"
        />

        <div className="space-y-2">
          <Label className="text-foreground">厨房类型</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {kitchenOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.kitchenType === opt.value}
                onClick={() => setFormData({ ...formData, kitchenType: opt.value })}
                title={opt.label}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">卫生间与卧室关系</Label>
          <div className="space-y-2">
            {bathroomOptions.map((opt) => (
              <ToggleCard
                key={opt.value}
                type="radio"
                name="bathroom"
                checked={formData.bathroomPosition === opt.value}
                onChange={() =>
                  setFormData({ ...formData, bathroomPosition: opt.value })
                }
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="空间布置"
        description="如果你已经看过房，这里补充床位和工作区的大概位置，有助于判断隐私、采光和噪声敏感区。"
      >
        <div className="space-y-2">
          <Label className="text-foreground">床位位置</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bedOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.bedPosition === opt.value}
                onClick={() => setFormData({ ...formData, bedPosition: opt.value })}
                title={opt.label}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">书桌或工作区位置</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {deskOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.deskPosition === opt.value}
                onClick={() => setFormData({ ...formData, deskPosition: opt.value })}
                title={opt.label}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="通风与潮湿"
        description="这里的目的不是做精细打分，而是先抓出入住后最容易后悔的问题。"
      >
        <div className="space-y-2">
          <Label className="text-foreground">通风情况</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ventilationOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.ventilation === opt.value}
                onClick={() => setFormData({ ...formData, ventilation: opt.value })}
                title={opt.label}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">是否看到以下迹象（可多选）</Label>
          <div className="space-y-2">
            {dampOptions.map((opt) => (
              <ToggleCard
                key={opt.id}
                checked={formData.dampSigns.includes(opt.id)}
                onChange={() => toggleDampSign(opt.id)}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="合租情况"
        description="只有在共用公共区域时才需要重点填写。这个信息会影响隐私、噪声和动线建议。"
      >
        <ToggleCard
          checked={formData.isShared}
          onChange={(checked) => setFormData({ ...formData, isShared: checked })}
          title="这套房是合租"
          description="与其他人共享客厅、厨房、卫生间或走廊。"
        />

        {formData.isShared ? (
          <div className="space-y-2">
            <Label className="text-foreground">同住人情况</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roommateOptions.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  selected={formData.roommateSituation === opt.value}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      roommateSituation: opt.value as RoommateSituation,
                    })
                  }
                  title={opt.label}
                  align="center"
                  className="min-h-20"
                />
              ))}
            </div>
          </div>
        ) : null}
      </FormSection>

      <NotePanel title="这一页的目的，是先找出最可能后悔的点">
        如果你对某些细节拿不准，也可以先按印象填写。第三步会再结合你的预算和容忍范围，给出更接近真实决策的建议。
      </NotePanel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-full border-border bg-background/80"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button type="submit" className="h-12 flex-1 rounded-full text-base">
          下一步：明确自己的底线
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
