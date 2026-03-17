/**
 * 空间数据结构定义
 * 用于描述房间的几何布局、功能分区和家具摆放
 */

// 基础几何类型
export interface Point {
  x: number; // 相对房间宽度的比例 0-1
  y: number; // 相对房间长度的比例 0-1
}

export interface Size {
  width: number;  // 相对宽度比例
  length: number; // 相对长度比例
}

export interface Rectangle {
  id: string;
  name: string;
  position: Point; // 左上角位置
  size: Size;
  rotation?: number; // 旋转角度，0-360
}

// 空间朝向
export type Direction = 
  | 'north' | 'northeast' | 'east' | 'southeast' 
  | 'south' | 'southwest' | 'west' | 'northwest';

// 房间类型
export type RoomType = 
  | 'bedroom'      // 卧室
  | 'living'       // 客厅
  | 'study'        // 书房/办公室
  | 'dining'       // 餐厅
  | 'kitchen'      // 厨房
  | 'bathroom'     // 卫生间
  | 'office'       // 办公空间
  | 'studio';      // 工作室/大开间

// 门类型
export type DoorType = 'entrance' | 'interior' | 'sliding' | 'french';

export interface Door extends Rectangle {
  type: DoorType;
  facing?: Direction; // 门的朝向
  leadsTo?: string;   // 通向哪个房间
}

// 窗户类型
export type WindowType = 'fixed' | 'sliding' | 'casement' | 'bay';

export interface Window extends Rectangle {
  type: WindowType;
  facing: Direction;
  size: Size & { height: number }; // height: 窗户高度（相对房间高度）
}

// 家具类型
export type FurnitureCategory = 
  | 'bed'           // 床
  | 'desk'          // 书桌/办公桌
  | 'chair'         // 椅子
  | 'sofa'          // 沙发
  | 'table'         // 餐桌/茶几
  | 'wardrobe'      // 衣柜
  | 'bookshelf'     // 书架
  | 'cabinet'       // 柜子
  | 'mirror'        // 镜子
  | 'tv'            // 电视
  | 'plant'         // 绿植
  | 'partition';    // 隔断

export interface Furniture extends Rectangle {
  category: FurnitureCategory;
  facing?: Direction; // 家具的朝向（如：床头朝向、书桌朝向）
  height?: number;    // 家具高度（用于判断横梁关系）
  isFixed?: boolean;  // 是否固定家具（如嵌入式衣柜）
}

// 功能分区
export type ZoneType = 
  | 'sleep'         // 睡眠区
  | 'work'          // 工作区
  | 'rest'          // 休息区
  | 'entrance'      // 入口区
  | 'transit'       // 通行区
  | 'storage';      // 储物区

export interface Zone extends Rectangle {
  type: ZoneType;
}

// 空间轮廓
export interface SpaceOutline {
  width: number;     // 实际宽度（米）
  length: number;    // 实际长度（米）
  height: number;    // 层高（米）
  shape: 'rectangle' | 'l-shape' | 'irregular';
  irregularPoints?: Point[]; // 不规则形状时使用
}

// 建筑结构元素
export interface StructuralElement extends Rectangle {
  type: 'beam' | 'column' | 'pipe';
  heightFromFloor?: number; // 距地面高度（用于横梁）
}

// 空间布局主类型
export interface SpaceLayout {
  // 基础信息
  id: string;
  name: string;
  roomType: RoomType;
  createdAt: string;
  
  // 空间几何
  outline: SpaceOutline;
  
  // 朝向（整体空间的主朝向）
  orientation: Direction;
  
  // 开口
  doors: Door[];
  windows: Window[];
  
  // 家具
  furnitures: Furniture[];
  
  // 功能分区
  zones: Zone[];
  
  // 建筑结构
  structures: StructuralElement[];
  
  // 用户备注
  userNotes?: {
    primaryUse: string;      // 主要用途
    painPoints: string[];    // 困扰点
    goals: string[];         // 改善目标
    specialNeeds?: string;   // 特殊需求
  };
}

// 分析结果类型
export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: RuleCategory;
  affectedItems: {
    type: 'furniture' | 'door' | 'window' | 'zone' | 'structure';
    id: string;
    name: string;
  }[];
  position?: Point; // 问题位置（可选）
  traditionalReason: string;
  modernReason: string;
  fixSuggestions: FixSuggestion[];
  scoreImpact: number; // 对总体评分的影响（0-100）
}

export type RuleCategory = 
  | 'layout'        // 布局
  | 'circulation'   // 动线
  | 'comfort'       // 舒适度
  | 'health'        // 健康
  | 'psychology'    // 心理
  | 'privacy';      // 隐私

export interface FixSuggestion {
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: 'move' | 'remove' | 'add' | 'adjust' | 'replace';
  difficulty: 'easy' | 'moderate' | 'hard';
  estimatedCost?: 'free' | 'low' | 'medium' | 'high';
  details?: {
    targetPosition?: Point;
    targetFurniture?: Partial<Furniture>;
    notes?: string;
  };
}

// 评分维度
export interface DimensionScore {
  dimension: 'layout' | 'lighting' | 'airflow' | 'visual' | 'spacious';
  score: number;
  maxScore: number;
  weight: number;
  violations: RuleViolation[];
}

// 完整分析报告
export interface SpaceAnalysisReport {
  spaceId: string;
  overallScore: number;
  dimensions: DimensionScore[];
  violations: RuleViolation[];
  strengths: string[];
  summary: string;
  generatedAt: string;
}

// 辅助类型：用于规则判断
export type Alignment = 'aligned' | 'offset' | 'perpendicular';
export type Proximity = 'immediate' | 'near' | 'moderate' | 'far';
