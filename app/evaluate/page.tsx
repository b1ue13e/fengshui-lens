"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, Home } from "lucide-react";
import { 
  LAYOUT_TYPES, 
  ORIENTATIONS, 
  FLOOR_LEVELS, 
  BUILDING_AGES,
  LAYOUT_TYPE_LABELS,
  ORIENTATION_LABELS,
  FLOOR_LEVEL_LABELS,
  BUILDING_AGE_LABELS,
  type LayoutType,
  type Orientation,
  type FloorLevel,
  type BuildingAge,
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

const layoutOptions = LAYOUT_TYPES.map(value => ({ 
  value, 
  label: LAYOUT_TYPE_LABELS[value] 
}));

const orientationOptions = ORIENTATIONS.map(value => ({ 
  value, 
  label: ORIENTATION_LABELS[value] 
}));

const floorOptions = FLOOR_LEVELS.map(value => ({ 
  value, 
  label: FLOOR_LEVEL_LABELS[value] 
}));

const ageOptions = BUILDING_AGES.map(value => ({ 
  value, 
  label: BUILDING_AGE_LABELS[value] 
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("basicInfo", JSON.stringify(formData));
    router.push("/evaluate/space");
  };

  const isComplete = formData.layoutType && formData.areaSqm && 
    formData.orientation && formData.floorLevel && 
    formData.totalFloors && formData.buildingAge;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
          <Home className="h-4 w-4" />
          <span>步骤 1/3</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">基础信息</h1>
        <p className="text-stone-600">先了解房屋的基本情况，约 1 分钟</p>
      </div>

      {/* 户型与面积 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          户型与面积
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {layoutOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={formData.layoutType === opt.value}
              onClick={() => setFormData({ ...formData, layoutType: opt.value })}
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </OptionCard>
          ))}
        </div>

        <div>
          <Label htmlFor="area" className="text-stone-700">面积（平方米）</Label>
          <Input
            id="area"
            type="number"
            placeholder="例如：45"
            value={formData.areaSqm}
            onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
            className="mt-1.5 h-12 text-lg"
          />
        </div>
      </section>

      {/* 朝向与楼层 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          朝向与楼层
        </h2>
        
        <div>
          <Label className="text-stone-700 mb-2 block">房屋朝向</Label>
          <div className="grid grid-cols-4 gap-2">
            {orientationOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={formData.orientation === opt.value}
                onClick={() => setFormData({ ...formData, orientation: opt.value })}
                className="p-3 text-center"
              >
                <span className="text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-stone-700 mb-2 block">楼层位置</Label>
            <div className="space-y-2">
              {floorOptions.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={formData.floorLevel === opt.value}
                  onClick={() => setFormData({ ...formData, floorLevel: opt.value })}
                  className="py-3"
                >
                  <span className="text-sm">{opt.label}</span>
                </OptionCard>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="totalFloors" className="text-stone-700">总楼层</Label>
            <Input
              id="totalFloors"
              type="number"
              placeholder="例如：18"
              value={formData.totalFloors}
              onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
              className="mt-1.5 h-12 text-lg"
            />
            
            <label className="flex items-center gap-3 mt-6 p-4 rounded-xl border-2 border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.hasElevator}
                onChange={(e) => setFormData({ ...formData, hasElevator: e.target.checked })}
                className="h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <div className="font-medium text-stone-900 text-sm">楼内有电梯</div>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* 建筑年代 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
          建筑年代
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {ageOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={formData.buildingAge === opt.value}
              onClick={() => setFormData({ ...formData, buildingAge: opt.value })}
            >
              <span className="text-sm">{opt.label}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 text-base"
        disabled={!isComplete}
      >
        下一步：空间评估
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
