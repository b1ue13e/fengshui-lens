"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Check, Sun, Wind, Building2 } from "lucide-react";
import { 
  KITCHEN_TYPES,
  BATHROOM_POSITIONS,
  BED_POSITIONS,
  DESK_POSITIONS,
  VENTILATION_TYPES,
  WINDOW_EXPOSURES,
  UNIT_POSITIONS,
  KITCHEN_TYPE_LABELS,
  BATHROOM_POSITION_LABELS,
  BED_POSITION_LABELS,
  DESK_POSITION_LABELS,
  VENTILATION_LABELS,
  WINDOW_EXPOSURE_LABELS,
  UNIT_POSITION_LABELS,
  type KitchenType,
  type BathroomPosition,
  type BedPosition,
  type DeskPosition,
  type Ventilation,
} from "@/types";

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
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
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

// Radio 卡片组件
function RadioCard({ 
  checked, 
  onChange, 
  name,
  title, 
  description 
}: { 
  checked: boolean; 
  onChange: () => void; 
  name: string;
  title: string;
  description?: string;
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      checked ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:bg-stone-50'
    }`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded-full border-stone-300 text-stone-900 focus:ring-stone-900 mt-0.5"
      />
      <div className="flex-1">
        <div className="font-medium text-stone-900 text-sm">{title}</div>
        {description && <div className="text-xs text-stone-500 mt-1">{description}</div>}
      </div>
    </label>
  );
}

const windowOptions = WINDOW_EXPOSURES.map(value => ({
  value,
  label: WINDOW_EXPOSURE_LABELS[value],
}));

const kitchenOptions = KITCHEN_TYPES.map(value => ({
  value,
  label: KITCHEN_TYPE_LABELS[value],
}));

const bathroomOptions = BATHROOM_POSITIONS.map(value => ({
  value,
  label: BATHROOM_POSITION_LABELS[value],
}));

const bedOptions = BED_POSITIONS.map(value => ({
  value,
  label: BED_POSITION_LABELS[value],
}));

const deskOptions = DESK_POSITIONS.map(value => ({
  value,
  label: DESK_POSITION_LABELS[value],
}));

const ventilationOptions = VENTILATION_TYPES.map(value => ({
  value,
  label: VENTILATION_LABELS[value],
}));

const unitPositionOptions = UNIT_POSITIONS.map(value => ({
  value,
  label: UNIT_POSITION_LABELS[value],
}));

const dampOptions = [
  { id: "condensation", label: "窗户/墙面有冷凝水" },
  { id: "mold_smell", label: "有霉味" },
  { id: "wall_damp", label: "墙面返潮/发霉" },
];

export default function SpaceDetailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hasWestFacingWindow: false,
    windowExposure: "full" as "full" | "partial" | "blocked",
    facesMainRoad: false,
    nearElevator: false,
    unitPosition: "middle" as "corner" | "middle" | "end",
    hasBalcony: false,
    kitchenType: "" as KitchenType | "",
    bathroomPosition: "" as BathroomPosition | "",
    bedPosition: "" as BedPosition | "",
    deskPosition: "" as DeskPosition | "",
    ventilation: "" as Ventilation | "",
    dampSigns: [] as string[],
    isShared: false,
    roommateSituation: "" as "couple" | "single" | "friends" | "strangers" | "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = sessionStorage.getItem("spaceInfo");
    const merged = existing ? { ...JSON.parse(existing), ...formData } : formData;
    sessionStorage.setItem("spaceInfo", JSON.stringify(merged));
    router.push("/evaluate/living");
  };

  const toggleDampSign = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dampSigns: prev.dampSigns.includes(id)
        ? prev.dampSigns.filter((s) => s !== id)
        : [...prev.dampSigns, id],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
          <Sun className="h-4 w-4" />
          <span>步骤 2/3</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">空间评估</h1>
        <p className="text-stone-600">评估采光、噪音、户型结构等关键因素，约 1 分钟</p>
      </div>

      {/* 采光与西晒 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Sun className="h-4 w-4" />
          采光与西晒
        </h2>
        
        <CheckboxCard
          checked={formData.hasWestFacingWindow}
          onChange={(checked) => setFormData({ ...formData, hasWestFacingWindow: checked })}
          title="卧室有西晒窗户（下午阳光直射）"
          description="夏天可能导致房间过热，增加空调能耗"
        />

        <div>
          <Label className="text-stone-700 mb-2 block">窗外采光情况</Label>
          <div className="space-y-2">
            {windowOptions.map((opt) => (
              <RadioCard
                key={opt.value}
                name="windowExposure"
                checked={formData.windowExposure === opt.value}
                onChange={() => setFormData({ ...formData, windowExposure: opt.value as any })}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 噪音因素 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Wind className="h-4 w-4" />
          噪音因素
        </h2>
        
        <div className="space-y-3">
          <CheckboxCard
            checked={formData.facesMainRoad}
            onChange={(checked) => setFormData({ ...formData, facesMainRoad: checked })}
            title="卧室/客厅临街（主干道）"
            description="可能有车辆噪音，影响休息"
          />
          <CheckboxCard
            checked={formData.nearElevator}
            onChange={(checked) => setFormData({ ...formData, nearElevator: checked })}
            title="房间靠近电梯井或电梯厅"
            description="可能有电梯运行噪音"
          />
        </div>

        <div>
          <Label className="text-stone-700 mb-2 block">户型位置</Label>
          <div className="grid grid-cols-3 gap-2">
            {unitPositionOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.unitPosition === opt.value}
                onClick={() => setFormData({ ...formData, unitPosition: opt.value as any })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>
      </section>

      {/* 户型结构 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          户型结构
        </h2>
        
        <CheckboxCard
          checked={formData.hasBalcony}
          onChange={(checked) => setFormData({ ...formData, hasBalcony: checked })}
          title="有独立阳台"
        />

        <div>
          <Label className="text-stone-700 mb-2 block">厨房类型</Label>
          <div className="grid grid-cols-3 gap-2">
            {kitchenOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.kitchenType === opt.value}
                onClick={() => setFormData({ ...formData, kitchenType: opt.value })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-stone-700 mb-2 block">卫生间与卧室关系</Label>
          <div className="space-y-2">
            {bathroomOptions.map((opt) => (
              <RadioCard
                key={opt.value}
                name="bathroom"
                checked={formData.bathroomPosition === opt.value}
                onChange={() => setFormData({ ...formData, bathroomPosition: opt.value as any })}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 空间布局 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          空间布局
        </h2>
        
        <div>
          <Label className="text-stone-700 mb-2 block">床位位置</Label>
          <div className="grid grid-cols-2 gap-2">
            {bedOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.bedPosition === opt.value}
                onClick={() => setFormData({ ...formData, bedPosition: opt.value })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-stone-700 mb-2 block">书桌/办公位位置</Label>
          <div className="grid grid-cols-2 gap-2">
            {deskOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.deskPosition === opt.value}
                onClick={() => setFormData({ ...formData, deskPosition: opt.value })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>
      </section>

      {/* 通风与潮湿 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          通风与潮湿
        </h2>
        
        <div>
          <Label className="text-stone-700 mb-2 block">通风情况</Label>
          <div className="grid grid-cols-2 gap-2">
            {ventilationOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.ventilation === opt.value}
                onClick={() => setFormData({ ...formData, ventilation: opt.value })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-stone-700 mb-2 block">是否有以下迹象？（多选）</Label>
          <div className="space-y-2">
            {dampOptions.map((opt) => (
              <CheckboxCard
                key={opt.id}
                checked={formData.dampSigns.includes(opt.id)}
                onChange={() => toggleDampSign(opt.id)}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 合租情况 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          合租情况
        </h2>
        
        <CheckboxCard
          checked={formData.isShared}
          onChange={(checked) => setFormData({ ...formData, isShared: checked })}
          title="是合租（与他人共用公共区域）"
        />

        {formData.isShared && (
          <div className="pl-4 border-l-2 border-stone-200">
            <Label className="text-stone-700 mb-2 block">同住人情况</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "couple", label: "伴侣/夫妻" },
                { value: "friends", label: "朋友" },
                { value: "strangers", label: "陌生人/室友" },
                { value: "single", label: "独立租住" },
              ].map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={formData.roommateSituation === opt.value}
                  onClick={() => setFormData({ ...formData, roommateSituation: opt.value as any })}
                  className="p-3 text-center"
                >
                  <span className="text-sm">{opt.label}</span>
                </OptionCard>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button type="submit" className="flex-1 h-12 text-base">
          下一步：居住需求
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
