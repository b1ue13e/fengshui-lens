/**
 * Listing Transformer - 房源数据防波堤
 * 
 * 职责：将外部脏数据（爬虫/API）清洗为引擎可识别的标准格式
 * 原则：在数据流入引擎前完成所有清洗和默认值降级
 * 
 * 新增：transform warnings + confidence 机制
 */

import { z } from 'zod';
import type { EvaluationInput, PrimaryGoal, FloorLevel, BuildingAge } from '@/lib/engine/types';

// ============================================================================
// 1. 类型定义
// ============================================================================

export type TransformWarningCode = 'missing' | 'invalid_format' | 'fallback_used' | 'ambiguous';

export interface TransformWarning {
  field: string;
  code: TransformWarningCode;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export type TransformConfidence = 'high' | 'medium' | 'low';

export interface TransformResult {
  input: Partial<EvaluationInput>;
  warnings: TransformWarning[];
  confidence: TransformConfidence;
}

// ============================================================================
// 2. 原始数据校验 Schema（第一层防线）
// ============================================================================

export const RawListingSchema = z.object({
  title: z.string().optional().default(''),
  floor_info: z.string().optional().default(''),
  total_floors: z.union([z.string(), z.number()]).optional(),
  floor_level: z.string().optional(),
  area: z.union([z.string(), z.number()]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  features: z.union([z.array(z.string()), z.string()]).optional(),
  orientation: z.string().optional().default('south'),
  building_age: z.union([z.string(), z.number()]).optional(),
  has_elevator: z.union([z.boolean(), z.string()]).optional(),
  layout: z.string().optional().default(''),
  address: z.string().optional().default(''),
  is_near_main_road: z.union([z.boolean(), z.string()]).optional(),
  rent_type: z.string().optional(),
});

export type RawListingData = z.infer<typeof RawListingSchema>;

// ============================================================================
// 3. 关键字段定义（用于 confidence 计算）
// ============================================================================

const CRITICAL_FIELDS: Array<keyof EvaluationInput> = [
  'floorLevel',
  'buildingAge',
  'orientation',
  'facesMainRoad',
  'primaryGoal',
  'isShared',
];

// ============================================================================
// 4. 转换器实现（带 warnings 收集）
// ============================================================================

export function transformRawToEngineInput(
  raw: unknown,
  options: { primaryGoal?: PrimaryGoal; strict?: boolean } = {}
): TransformResult {
  const { primaryGoal = 'sleep_quality', strict = false } = options;
  
  const warnings: TransformWarning[] = [];
  
  // 辅助函数：添加 warning
  const addWarning = (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => {
    warnings.push({ field, code, message, severity });
  };
  
  // 第一层：Zod 校验
  const parseResult = RawListingSchema.safeParse(raw);
  if (!parseResult.success) {
    if (strict) {
      throw new Error(`数据校验失败: ${parseResult.error.message}`);
    }
    addWarning('root', 'invalid_format', `数据格式异常: ${parseResult.error.message}`, 'high');
  }
  
  const data = parseResult.success ? parseResult.data : RawListingSchema.parse({});
  
  // 第二层：字段转换（带 warnings 收集）
  const layoutType = parseLayout(data.layout, warnings, addWarning);
  const areaSqm = parseArea(data.area, warnings, addWarning);
  const orientation = parseOrientation(data.orientation, warnings, addWarning);
  const floorLevel = parseFloorLevel(data.floor_info, data.floor_level, warnings, addWarning);
  const totalFloors = parseTotalFloors(data.floor_info, data.total_floors, warnings, addWarning);
  const hasElevator = parseHasElevator(data.has_elevator, data.floor_info, warnings, addWarning);
  const buildingAge = parseBuildingAge(data.building_age, warnings, addWarning);
  
  const hasWestFacingWindow = extractFromTags(data.tags, ['西晒', '西向', '朝西']);
  const facesMainRoad = parseFacesMainRoad(data.is_near_main_road, data.tags, warnings, addWarning);
  const nearElevator = extractFromTags(data.tags, ['电梯旁', '近电梯']);
  const isShared = parseIsShared(data.rent_type);
  const roommateSituation = parseRoommateSituation(data.rent_type, data.title, warnings, addWarning);
  
  // 检查关键字段是否使用默认值
  if (floorLevel === 'middle' && !data.floor_info && !data.floor_level) {
    addWarning('floorLevel', 'fallback_used', '楼层信息缺失，使用默认值 middle', 'high');
  }
  if (buildingAge === 'medium' && !data.building_age) {
    addWarning('buildingAge', 'fallback_used', '建筑年代缺失，使用默认值 medium', 'medium');
  }
  if (orientation === 'south' && !data.orientation) {
    addWarning('orientation', 'fallback_used', '朝向信息缺失，使用默认值 south', 'medium');
  }
  if (facesMainRoad === false && !data.is_near_main_road && !data.tags) {
    addWarning('facesMainRoad', 'fallback_used', '临街信息缺失，使用默认值 false（保守假设）', 'low');
  }
  
  const result: Partial<EvaluationInput> = {
    layoutType,
    areaSqm,
    orientation,
    floorLevel,
    totalFloors,
    hasElevator,
    buildingAge,
    hasWestFacingWindow,
    facesMainRoad,
    nearElevator,
    isShared,
    roommateSituation,
    windowExposure: 'full',
    unitPosition: 'middle',
    hasBalcony: extractFromTags(data.tags, ['阳台', '有阳台']),
    kitchenType: extractFromTags(data.tags, ['开放式厨房', 'open kitchen']) ? 'open' : 'closed',
    bathroomPosition: 'far_from_bedroom',
    bedPosition: 'away_from_door',
    deskPosition: 'facing_window',
    ventilation: 'good',
    dampSigns: [],
    primaryGoal,
    monthlyBudget: 'medium',
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  };
  
  // 计算 confidence
  const confidence = calculateConfidence(warnings);
  
  return {
    input: result,
    warnings,
    confidence,
  };
}

// ============================================================================
// 5. Confidence 计算（轻量、可解释）
// ============================================================================

function calculateConfidence(warnings: TransformWarning[]): TransformConfidence {
  const highCount = warnings.filter(w => w.severity === 'high').length;
  const mediumCount = warnings.filter(w => w.severity === 'medium').length;
  const criticalFieldWarnings = warnings.filter(w => 
    CRITICAL_FIELDS.includes(w.field as any) && (w.severity === 'high' || w.severity === 'medium')
  );
  
  // 关键字段有 high warning -> low
  if (criticalFieldWarnings.length > 0 || highCount > 0) {
    return 'low';
  }
  
  // 多个 medium warning -> medium
  if (mediumCount >= 2) {
    return 'medium';
  }
  
  // 无 warning 或仅 low -> high
  return 'high';
}

// ============================================================================
// 6. 字段解析函数（带 warnings）
// ============================================================================

function parseLayout(
  layout: string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): EvaluationInput['layoutType'] {
  if (!layout) {
    addWarning('layout', 'missing', '户型信息缺失，使用默认值 one_bedroom', 'low');
    return 'one_bedroom';
  }
  
  const normalized = layout.toLowerCase().replace(/\s/g, '');
  
  if (normalized.includes('3室') || normalized.includes('三室')) return 'three_bedroom';
  if (normalized.includes('2室') || normalized.includes('两室') || normalized.includes('二室')) return 'two_bedroom';
  if (normalized.includes('1室') || normalized.includes('一室')) return 'one_bedroom';
  if (normalized.includes('主卧') || normalized.includes('次卧') || normalized.includes('合租')) return 'studio';
  
  addWarning('layout', 'ambiguous', `无法识别户型 "${layout}"，使用默认值 one_bedroom`, 'low');
  return 'one_bedroom';
}

function parseArea(
  area: string | number | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): number {
  if (typeof area === 'number') return area;
  if (!area) {
    addWarning('areaSqm', 'missing', '面积信息缺失，使用默认值 50', 'medium');
    return 50;
  }
  
  const match = String(area).match(/(\d+\.?\d*)/);
  if (!match) {
    addWarning('areaSqm', 'invalid_format', `无法解析面积 "${area}"，使用默认值 50`, 'medium');
    return 50;
  }
  return parseFloat(match[1]);
}

function parseOrientation(
  orientation: string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): EvaluationInput['orientation'] {
  if (!orientation) return 'south';
  
  const normalized = orientation.toLowerCase();
  
  if (normalized.includes('南')) return 'south';
  if (normalized.includes('北')) return 'north';
  if (normalized.includes('东')) return 'east';
  if (normalized.includes('西')) return 'west';
  
  addWarning('orientation', 'ambiguous', `无法识别朝向 "${orientation}"，使用默认值 south`, 'medium');
  return 'south';
}

function parseFloorLevel(
  floorInfo: string | undefined,
  floorLevel: string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): FloorLevel {
  if (floorLevel) {
    const normalized = floorLevel.toLowerCase();
    if (normalized.includes('低') || normalized.includes('底')) return 'low';
    if (normalized.includes('高')) return 'high';
    if (normalized.includes('中')) return 'middle';
  }
  
  if (floorInfo) {
    const normalized = floorInfo.toLowerCase();
    if (normalized.includes('低') || normalized.includes('底')) return 'low';
    if (normalized.includes('高')) return 'high';
    if (normalized.includes('中')) return 'middle';
    
    const match = normalized.match(/(\d+)层/);
    if (match) {
      const floor = parseInt(match[1], 10);
      const totalMatch = normalized.match(/共(\d+)层/);
      const total = totalMatch ? parseInt(totalMatch[1], 10) : 20;
      
      if (floor <= 3) return 'low';
      if (floor >= total - 3) return 'high';
      return 'middle';
    }
  }
  
  return 'middle';
}

function parseTotalFloors(
  floorInfo: string | undefined,
  totalFloors: string | number | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): number {
  if (typeof totalFloors === 'number') return totalFloors;
  if (typeof totalFloors === 'string') {
    const parsed = parseInt(totalFloors, 10);
    if (!isNaN(parsed)) return parsed;
  }
  
  if (floorInfo) {
    const match = floorInfo.match(/共(\d+)层/);
    if (match) return parseInt(match[1], 10);
  }
  
  addWarning('totalFloors', 'fallback_used', '总楼层信息缺失，使用默认值 18', 'low');
  return 18;
}

function parseHasElevator(
  hasElevator: boolean | string | undefined,
  floorInfo: string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): boolean {
  if (typeof hasElevator === 'boolean') return hasElevator;
  if (typeof hasElevator === 'string') {
    const has = hasElevator.toLowerCase().includes('有') || hasElevator === 'true';
    if (!has && hasElevator.toLowerCase().includes('无')) {
      return false;
    }
    if (has) return true;
  }
  
  if (floorInfo) {
    const match = floorInfo.match(/共(\d+)层/);
    if (match) {
      return parseInt(match[1], 10) > 7;
    }
  }
  
  addWarning('hasElevator', 'fallback_used', '电梯信息缺失，根据楼层推断或使用默认值 true', 'low');
  return true;
}

function parseBuildingAge(
  buildingAge: string | number | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): BuildingAge {
  let year: number | null = null;
  
  if (typeof buildingAge === 'number') {
    year = buildingAge > 2000 ? buildingAge : null;
  } else if (typeof buildingAge === 'string') {
    const match = buildingAge.match(/(\d{4})/);
    if (match) year = parseInt(match[1], 10);
  }
  
  if (year) {
    const age = new Date().getFullYear() - year;
    if (age <= 5) return 'new';
    if (age <= 15) return 'medium';
    return 'old';
  }
  
  return 'medium';
}

function parseFacesMainRoad(
  isNearMainRoad: boolean | string | undefined,
  tags: string[] | string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): boolean {
  if (typeof isNearMainRoad === 'boolean') return isNearMainRoad;
  if (typeof isNearMainRoad === 'string') {
    return isNearMainRoad.toLowerCase() === 'true';
  }
  
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(/[,，]/);
    const hasMainRoadTag = tagArray.some(tag => 
      /临街|临主路|临马路|噪音/.test(tag)
    );
    if (hasMainRoadTag) return true;
  }
  
  return false;
}

function parseIsShared(rentType: string | undefined): boolean {
  if (!rentType) return false;
  const normalized = rentType.toLowerCase();
  return normalized.includes('合租') || normalized.includes('主卧') || normalized.includes('次卧');
}

function parseRoommateSituation(
  rentType: string | undefined,
  title: string | undefined,
  warnings: TransformWarning[],
  addWarning: (field: string, code: TransformWarningCode, message: string, severity: 'low' | 'medium' | 'high') => void
): string | undefined {
  const text = `${rentType || ''} ${title || ''}`.toLowerCase();
  
  if (text.includes('限女生') || text.includes('限男生') || text.includes('情侣')) {
    return 'strangers';
  }
  
  if (parseIsShared(rentType)) {
    addWarning('roommateSituation', 'fallback_used', '合租场景但无法确定室友关系，保守假设为 strangers', 'medium');
    return 'strangers';
  }
  
  return undefined;
}

function extractFromTags(tags: string[] | string | undefined, keywords: string[]): boolean {
  if (!tags) return false;
  const tagArray = Array.isArray(tags) ? tags : tags.split(/[,，]/);
  return tagArray.some(tag => keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase())));
}

// ============================================================================
// 7. 批量转换（保留兼容）
// ============================================================================

export function transformBatch(
  listings: unknown[],
  options: { primaryGoal?: PrimaryGoal; strict?: boolean } = {}
): Array<{ result: TransformResult; index: number }> {
  return listings.map((raw, index) => ({
    result: transformRawToEngineInput(raw, options),
    index,
  }));
}
