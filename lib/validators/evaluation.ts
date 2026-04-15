import { z } from 'zod';
import {
  LAYOUT_TYPES,
  ORIENTATIONS,
  FLOOR_LEVELS,
  BUILDING_AGES,
  KITCHEN_TYPES,
  BATHROOM_POSITIONS,
  BED_POSITIONS,
  DESK_POSITIONS,
  VENTILATION_TYPES,
  PRIMARY_GOALS,
  BUDGET_RANGES,
  WINDOW_EXPOSURES,
  UNIT_POSITIONS,
} from "@/lib/rent-tools/constants/evaluation";

// 基础信息验证
export const basicInfoSchema = z.object({
  layoutType: z.enum(LAYOUT_TYPES),
  areaSqm: z.number().min(5).max(500),
  orientation: z.enum(ORIENTATIONS),
  floorLevel: z.enum(FLOOR_LEVELS),
  totalFloors: z.number().min(1).max(100),
  hasElevator: z.boolean(),
  buildingAge: z.enum(BUILDING_AGES),
});

// 空间详情验证
export const spaceDetailSchema = z.object({
  hasWestFacingWindow: z.boolean(),
  windowExposure: z.enum(WINDOW_EXPOSURES),
  facesMainRoad: z.boolean(),
  nearElevator: z.boolean(),
  unitPosition: z.enum(UNIT_POSITIONS),
  hasBalcony: z.boolean(),
  kitchenType: z.enum(KITCHEN_TYPES),
  bathroomPosition: z.enum(BATHROOM_POSITIONS),
  bedPosition: z.enum(BED_POSITIONS),
  deskPosition: z.enum(DESK_POSITIONS),
  ventilation: z.enum(VENTILATION_TYPES),
  dampSigns: z.array(z.string()).optional(),
  isShared: z.boolean(),
  roommateSituation: z.string().optional(),
});

// 居住需求验证
export const livingNeedsSchema = z.object({
  primaryGoal: z.enum(PRIMARY_GOALS),
  monthlyBudget: z.enum(BUDGET_RANGES),
  allowsLightRenovation: z.boolean(),
  allowsFurnitureMove: z.boolean(),
  allowsSoftImprovements: z.boolean(),
});

// 完整评估验证
export const fullEvaluationSchema = basicInfoSchema
  .merge(spaceDetailSchema)
  .merge(livingNeedsSchema);

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type SpaceDetailInput = z.infer<typeof spaceDetailSchema>;
export type LivingNeedsInput = z.infer<typeof livingNeedsSchema>;
export type FullEvaluationInput = z.infer<typeof fullEvaluationSchema>;
