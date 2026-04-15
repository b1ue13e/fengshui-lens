"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, Layers3, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CoachTip,
  ChoiceCard,
  FormSection,
  NotePanel,
  PageIntro,
} from "@/components/evaluate/form-primitives";
import {
  BUILDING_AGES,
  BUILDING_AGE_LABELS,
  FLOOR_LEVELS,
  FLOOR_LEVEL_LABELS,
  LAYOUT_TYPES,
  LAYOUT_TYPE_LABELS,
  ORIENTATIONS,
  ORIENTATION_LABELS,
  type BuildingAge,
  type FloorLevel,
  type LayoutType,
  type Orientation,
} from "@/lib/rent-tools/types";

const layoutOptions = LAYOUT_TYPES.map((value) => ({
  value,
  label: LAYOUT_TYPE_LABELS[value],
  description:
    value === "studio"
      ? "一个人住常见，优先留意收纳和通风"
      : value === "one_bedroom"
        ? "起居和睡眠区能分开，判断会更稳"
        : value === "two_bedroom"
          ? "适合合住或留工作区，注意隐私和动线"
          : "面积通常更大，也更要看总预算和维护成本",
}));

const orientationOptions = ORIENTATIONS.map((value) => ({
  value,
  label: ORIENTATION_LABELS[value],
  description:
    value === "south" || value === "southeast" || value === "southwest"
      ? "白天通常更亮"
      : value === "west"
        ? "下午可能偏晒"
        : value === "north"
          ? "更要注意阴冷感"
          : "采光要结合遮挡一起看",
}));

const floorOptions = FLOOR_LEVELS.map((value) => ({
  value,
  label: FLOOR_LEVEL_LABELS[value],
}));

const ageOptions = BUILDING_AGES.map((value) => ({
  value,
  label: BUILDING_AGE_LABELS[value],
}));

export default function BasicInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    layoutType: "" as LayoutType | "",
    areaSqm: "",
    orientation: "" as Orientation | "",
    floorLevel: "" as FloorLevel | "",
    totalFloors: "",
    hasElevator: false,
    buildingAge: "" as BuildingAge | "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sessionStorage.setItem("basicInfo", JSON.stringify(formData));
    router.push("/rent/tools/evaluate/space");
  };

  const isComplete =
    formData.layoutType &&
    formData.areaSqm &&
    formData.orientation &&
    formData.floorLevel &&
    formData.totalFloors &&
    formData.buildingAge;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageIntro
        step="STEP 1 / 3"
        title="先记下这套房最基础的信息。"
        description="第一次租房最怕一上来就被装修和话术带走。这一页只填最容易确认的内容，先把房源底子记清楚。"
        icon={Home}
        chips={["约 1 分钟", "先记基础信息", "新手也能直接填"]}
      />

      <CoachTip
        title="这一页先别纠结细节，先把底子记住"
        items={[
          "房源页写什么就先记什么，不需要一开始就追求特别精确。",
          "先别被精装、网红布置和拍照角度带跑，底子信息比风格更重要。",
        ]}
      />

      <FormSection
        title="户型与面积"
        description="先确定空间轮廓。面积不需要特别精确，按房源页或中介报给你的数字填写就够了。"
        icon={Layers3}
      >
        <div className="grid grid-cols-2 gap-3">
          {layoutOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={formData.layoutType === opt.value}
              onClick={() => setFormData({ ...formData, layoutType: opt.value })}
              title={opt.label}
              description={opt.description}
              eyebrow="户型"
            />
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="text-foreground">
            面积（平方米）
          </Label>
          <Input
            id="area"
            type="number"
            placeholder="例如 45，不确定就按房源页填写"
            value={formData.areaSqm}
            onChange={(event) => setFormData({ ...formData, areaSqm: event.target.value })}
            className="h-14 rounded-[1.15rem] border-border bg-background/80 px-4 text-base shadow-[0_8px_20px_rgba(95,83,57,0.04)]"
          />
        </div>
      </FormSection>

      <FormSection
        title="朝向与楼层"
        description="这组信息会直接影响采光、噪声和日常舒适度，是第一次租房最该先学会看的基础项。"
        icon={MapPinned}
      >
        <div className="space-y-2">
          <Label className="text-foreground">房屋朝向</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {orientationOptions.map((opt) => (
              <ChoiceCard
                key={opt.value}
                selected={formData.orientation === opt.value}
                onClick={() => setFormData({ ...formData, orientation: opt.value })}
                title={opt.label}
                description={opt.description}
                align="center"
                className="min-h-20"
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-2">
            <Label className="text-foreground">所在楼层位置</Label>
            <div className="space-y-2">
              {floorOptions.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  selected={formData.floorLevel === opt.value}
                  onClick={() => setFormData({ ...formData, floorLevel: opt.value })}
                  title={opt.label}
                  className="min-h-0"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalFloors" className="text-foreground">
                总楼层数
              </Label>
              <Input
                id="totalFloors"
                type="number"
                placeholder="例如 28，不知道就填大概"
                value={formData.totalFloors}
                onChange={(event) =>
                  setFormData({ ...formData, totalFloors: event.target.value })
                }
                className="h-14 rounded-[1.15rem] border-border bg-background/80 px-4 text-base shadow-[0_8px_20px_rgba(95,83,57,0.04)]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-[1.35rem] border border-border bg-background/78 px-4 py-4 transition-all hover:border-primary/20 hover:bg-card">
              <input
                type="checkbox"
                checked={formData.hasElevator}
                onChange={(event) =>
                  setFormData({ ...formData, hasElevator: event.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <div>
                <div className="text-sm font-medium text-foreground">楼内有电梯</div>
                <div className="text-sm leading-6 text-muted-foreground">
                  会影响通行便利和部分噪声判断。
                </div>
              </div>
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="楼龄"
        description="楼龄会影响管线、隔音、潮湿和后续补救空间。先填大概区间即可，不需要查得特别细。"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ageOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={formData.buildingAge === opt.value}
              onClick={() => setFormData({ ...formData, buildingAge: opt.value })}
              title={opt.label}
              align="center"
              className="min-h-20"
            />
          ))}
        </div>
      </FormSection>

      <NotePanel title="下一页会开始看房重点">
        系统接下来会带你看采光、临街、潮湿和户型细节。这些内容比房源文案更接近真实住进去的体验。
      </NotePanel>

      <Button
        type="submit"
        className="h-12 w-full rounded-full px-6 text-base"
        disabled={!isComplete}
      >
        下一步：继续看房重点
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
