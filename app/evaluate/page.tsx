"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, Layers3, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
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
} from "@/types";

const layoutOptions = LAYOUT_TYPES.map((value) => ({
  value,
  label: LAYOUT_TYPE_LABELS[value],
}));

const orientationOptions = ORIENTATIONS.map((value) => ({
  value,
  label: ORIENTATION_LABELS[value],
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
    router.push("/evaluate/space");
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
        title="先把这套房的客观条件录清楚。"
        description="这一页只填最容易确认的信息，比如户型、面积、朝向、楼层和楼龄。先把房源轮廓定下来，后面的风险判断才会更稳。"
        icon={Home}
        chips={["约 1 分钟", "先填客观条件", "适合边看边录"]}
      />

      <FormSection
        title="户型与面积"
        description="先确定空间轮廓。面积不需要特别精确，按房源页或中介给出的数字填写即可。"
        icon={Layers3}
      >
        <div className="grid grid-cols-2 gap-3">
          {layoutOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={formData.layoutType === opt.value}
              onClick={() => setFormData({ ...formData, layoutType: opt.value })}
              title={opt.label}
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
            placeholder="例如 45"
            value={formData.areaSqm}
            onChange={(event) => setFormData({ ...formData, areaSqm: event.target.value })}
            className="h-14 rounded-[1.15rem] border-border bg-background/80 px-4 text-base shadow-[0_8px_20px_rgba(95,83,57,0.04)]"
          />
        </div>
      </FormSection>

      <FormSection
        title="朝向与楼层"
        description="这组信息会直接影响采光、噪声和日常舒适度，是后续判断里最关键的一组基础项。"
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
                placeholder="例如 28"
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
        description="楼龄会影响管线、隔音、潮湿和改造空间。先用大概区间即可，不需要查到特别细。"
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

      <NotePanel title="这一页结束后会进入空间情况">
        系统下一步会继续询问采光、临街、潮湿和户型细节。这些内容比房源文案更接近真实居住体验。
      </NotePanel>

      <Button
        type="submit"
        className="h-12 w-full rounded-full px-6 text-base"
        disabled={!isComplete}
      >
        下一步：填写空间情况
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
