/**
 * 空间布局规则引擎
 * 
 * 架构说明：
 * 1. 每条规则都是独立的 Rule 对象，包含元数据和评估逻辑
 * 2. RuleEngine 负责管理和执行所有规则
 * 3. 规则评估返回结构化的 RuleViolation 或 null（无违规）
 * 4. 支持规则的动态注册和优先级排序
 * 
 * 扩展指南：
 * - 添加新规则：实现 Rule 接口，在 RuleEngine 中注册
 * - 修改规则逻辑：直接修改对应规则的 evaluate 方法
 * - 调整规则权重：修改 severity 或 scoreImpact
 */

import {
  SpaceLayout,
  RuleViolation,
  RuleCategory,
  FixSuggestion,
  Furniture,
  Door,
  Point,
  Rectangle,
  Direction,
} from '@/types/space';

// 规则严重级别
export type Severity = 'critical' | 'warning' | 'suggestion';

// 规则接口定义
export interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  applicableRoomTypes: string[] | 'all';
  traditionalReason: string;
  modernReason: string;
  scoreImpact: number; // 违规时的扣分值
  evaluate: (space: SpaceLayout) => RuleViolation | null;
}

// 几何计算工具函数
const GeometryUtils = {
  // 计算两点之间的距离
  distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  },

  // 获取矩形的中心点
  center(rect: Rectangle): Point {
    return {
      x: rect.position.x + rect.size.width / 2,
      y: rect.position.y + rect.size.length / 2,
    };
  },

  // 判断两个矩形是否在同一直线上（允许一定误差）
  isAligned(rect1: Rectangle, rect2: Rectangle, tolerance: number = 0.15): boolean {
    const c1 = this.center(rect1);
    const c2 = this.center(rect2);
    
    // 检查水平对齐
    const horizontalAligned = Math.abs(c1.x - c2.x) < tolerance;
    // 检查垂直对齐
    const verticalAligned = Math.abs(c1.y - c2.y) < tolerance;
    
    return horizontalAligned || verticalAligned;
  },

  // 判断两个矩形是否正对（门对门、门对窗等）
  isFacing(rect1: Rectangle, rect2: Rectangle, tolerance: number = 0.15): boolean {
    const c1 = this.center(rect1);
    const c2 = this.center(rect2);
    
    // 正对意味着在一条直线上，且距离较近
    const dist = this.distance(c1, c2);
    const aligned = this.isAligned(rect1, rect2, tolerance);
    
    return aligned && dist > 0.1; // 距离不能太近
  },

  // 判断点是否在矩形内
  contains(rect: Rectangle, point: Point): boolean {
    return (
      point.x >= rect.position.x &&
      point.x <= rect.position.x + rect.size.width &&
      point.y >= rect.position.y &&
      point.y <= rect.position.y + rect.size.length
    );
  },

  // 获取家具朝向的对面方向
  getOppositeDirection(dir: Direction): Direction {
    const opposites: Record<Direction, Direction> = {
      north: 'south', south: 'north',
      east: 'west', west: 'east',
      northeast: 'southwest', southwest: 'northeast',
      southeast: 'northwest', northwest: 'southeast',
    };
    return opposites[dir];
  },

  // 判断两个方向是否相对
  isOpposite(dir1: Direction, dir2: Direction): boolean {
    return this.getOppositeDirection(dir1) === dir2;
  },

  // 计算动线路径是否穿越某区域
  doesPathCrossZone(start: Point, end: Point, zone: Rectangle): boolean {
    // 简化判断：检查路径是否穿过矩形的中心区域
    const zoneCenter = this.center(zone);
    const pathDist = this.distance(start, end);
    const distToStart = this.distance(start, zoneCenter);
    const distToEnd = this.distance(end, zoneCenter);
    
    // 如果到起终点的距离之和接近路径总长，说明在路径上
    return Math.abs(distToStart + distToEnd - pathDist) < 0.1;
  },

  // 判断一个点是否在矩形上方（用于横梁检测）
  isAbove(item: Rectangle, beam: Rectangle, tolerance: number = 0.1): boolean {
    const itemCenter = this.center(item);
    const beamCenter = this.center(beam);
    
    // 水平位置重叠
    const horizontalOverlap = 
      Math.abs(itemCenter.x - beamCenter.x) < (item.size.width + beam.size.width) / 2 + tolerance;
    // 垂直位置接近
    const verticalClose = 
      Math.abs(itemCenter.y - beamCenter.y) < (item.size.length + beam.size.length) / 2 + tolerance;
    
    return horizontalOverlap && verticalClose;
  },
};

// 规则工厂：创建修复建议
const createFixSuggestion = (
  priority: FixSuggestion['priority'],
  description: string,
  action: FixSuggestion['action'],
  difficulty: FixSuggestion['difficulty'],
  details?: FixSuggestion['details']
): FixSuggestion => ({
  priority,
  description,
  action,
  difficulty,
  details,
});

// ==================== 规则定义 ====================

// 规则1: 入户门直冲卧室门
const doorToBedroomDoorRule: Rule = {
  id: 'door-to-bedroom-door',
  name: '入户门直冲卧室门',
  description: '入户门与卧室门正对，形成直冲',
  category: 'privacy',
  severity: 'warning',
  applicableRoomTypes: ['bedroom', 'studio'],
  traditionalReason: '气流直冲卧室，不利于隐私保护和休息质量',
  modernReason: '入户视线直通卧室，缺乏隐私缓冲，且开关门产生的空气流动和噪音可能影响睡眠',
  scoreImpact: 15,
  evaluate(space) {
    const entrance = space.doors.find(d => d.type === 'entrance');
    if (!entrance) return null;

    const bedroomDoor = space.doors.find(d => 
      d.type === 'interior' && 
      (space.roomType === 'bedroom' || d.leadsTo?.includes('bedroom'))
    );
    if (!bedroomDoor) return null;

    if (GeometryUtils.isFacing(entrance, bedroomDoor)) {
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'door', id: entrance.id, name: '入户门' },
          { type: 'door', id: bedroomDoor.id, name: '卧室门' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('high', '在卧室门口设置屏风或隔断', 'add', 'moderate'),
          createFixSuggestion('medium', '调整卧室门位置（装修期）', 'adjust', 'hard'),
          createFixSuggestion('low', '在入户门处设置玄关柜阻挡视线', 'add', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则2: 入户门直冲阳台/窗
const doorToWindowRule: Rule = {
  id: 'door-to-window',
  name: '入户门直冲阳台或窗户',
  description: '入户门正对阳台门或大窗户，形成穿堂风',
  category: 'circulation',
  severity: 'warning',
  applicableRoomTypes: 'all',
  traditionalReason: '气流直进直出，不利于聚气，能量无法在空间内停留',
  modernReason: '强烈的穿堂风影响舒适度，冬季增加能耗，且可能吹动门窗产生噪音',
  scoreImpact: 12,
  evaluate(space) {
    const entrance = space.doors.find(d => d.type === 'entrance');
    if (!entrance) return null;

    // 检查对窗
    const facingWindow = space.windows.find(w => 
      GeometryUtils.isFacing(entrance, w as Rectangle)
    );
    
    // 检查对阳台门
    const balconyDoor = space.doors.find(d => 
      d.type === 'sliding' && 
      GeometryUtils.isFacing(entrance, d)
    );

    const target = facingWindow || balconyDoor;
    if (!target) return null;

    const isWindow = 'facing' in target && 'type' in target && target.type !== 'sliding';

    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      category: this.category,
      affectedItems: [
        { type: 'door', id: entrance.id, name: '入户门' },
        { type: isWindow ? 'window' : 'door', id: target.id, name: isWindow ? '窗户' : '阳台门' },
      ],
      traditionalReason: this.traditionalReason,
      modernReason: this.modernReason,
      fixSuggestions: [
        createFixSuggestion('medium', '在门与窗之间设置玄关柜或屏风', 'add', 'moderate'),
        createFixSuggestion('medium', '使用厚重窗帘减缓气流', 'add', 'easy'),
        createFixSuggestion('low', '在通道中间放置大型绿植', 'add', 'easy'),
      ],
      scoreImpact: this.scoreImpact,
    };
  },
};

// 规则3: 镜子正对床
const mirrorFacingBedRule: Rule = {
  id: 'mirror-facing-bed',
  name: '镜子正对床',
  description: '镜子直接反射床铺，包括全身镜或镜面衣柜门',
  category: 'psychology',
  severity: 'critical',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '镜面反射扰动睡眠气场，易产生惊扰，影响精神状态',
  modernReason: '夜间醒来时镜中倒影可能造成惊吓，影响睡眠质量和心理健康',
  scoreImpact: 20,
  evaluate(space) {
    const bed = space.furnitures.find(f => f.category === 'bed');
    if (!bed) return null;

    const mirrors = space.furnitures.filter(f => f.category === 'mirror');
    
    for (const mirror of mirrors) {
      // 检查镜子是否正对床
      if (GeometryUtils.isFacing(mirror, bed)) {
        return {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          category: this.category,
          affectedItems: [
            { type: 'furniture', id: bed.id, name: '床' },
            { type: 'furniture', id: mirror.id, name: '镜子' },
          ],
          traditionalReason: this.traditionalReason,
          modernReason: this.modernReason,
          fixSuggestions: [
            createFixSuggestion('high', '移动镜子位置，避免正对床', 'move', 'easy'),
            createFixSuggestion('high', '给镜面衣柜加装布帘或不透明贴膜', 'add', 'easy'),
            createFixSuggestion('medium', '调整床的朝向（如果可行）', 'move', 'moderate'),
          ],
          scoreImpact: this.scoreImpact,
        };
      }
    }
    return null;
  },
};

// 规则4: 床头靠窗
const bedAgainstWindowRule: Rule = {
  id: 'bed-against-window',
  name: '床头靠窗',
  description: '床头紧贴窗户或位于窗户正下方',
  category: 'comfort',
  severity: 'warning',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '缺乏靠山，气流直冲头部，不利于休息和安全感',
  modernReason: '窗户附近温度变化大、噪音多，且窗帘开关不便，影响睡眠质量',
  scoreImpact: 15,
  evaluate(space) {
    const bed = space.furnitures.find(f => f.category === 'bed');
    if (!bed || !bed.facing) return null;

    // 找到床头的位置（与 facing 相反的方向）
    const headDirection = GeometryUtils.getOppositeDirection(bed.facing);
    const bedHeadPoint: Point = {
      x: bed.position.x + bed.size.width / 2,
      y: bed.position.y + (headDirection === 'north' ? 0 : bed.size.length),
    };

    // 检查是否有窗户在床头附近
    const windowBehind = space.windows.find(w => {
      const windowRect = w as Rectangle;
      // 检查床头是否在窗户的水平范围内且距离很近
      const bedHeadCenterX = bed.position.x + bed.size.width / 2;
      const windowCenterX = windowRect.position.x + windowRect.size.width / 2;
      const horizontalAligned = Math.abs(bedHeadCenterX - windowCenterX) < 0.2;
      const closeDistance = Math.abs(
        (headDirection === 'north' ? bed.position.y : bed.position.y + bed.size.length) -
        (windowRect.position.y + windowRect.size.length / 2)
      ) < 0.15;
      
      return horizontalAligned && closeDistance;
    });

    if (windowBehind) {
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'furniture', id: bed.id, name: '床' },
          { type: 'window', id: windowBehind.id, name: '窗户' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('high', '调整床的位置，使床头靠实墙', 'move', 'moderate'),
          createFixSuggestion('medium', '加装厚窗帘和窗密封条', 'add', 'easy'),
          createFixSuggestion('low', '在床头设置软包靠背作为缓冲', 'add', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则5: 床尾对门
const bedFeetToDoorRule: Rule = {
  id: 'bed-feet-to-door',
  name: '床尾对门',
  description: '床尾正对着房门',
  category: 'psychology',
  severity: 'suggestion',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '传统观念中认为脚朝门不吉利，影响安全感',
  modernReason: '门外活动容易被床尾方向感知，缺乏隐私，可能影响入睡时的放松状态',
  scoreImpact: 8,
  evaluate(space) {
    const bed = space.furnitures.find(f => f.category === 'bed');
    if (!bed || !bed.facing) return null;

    // 床尾方向与床头相反
    const feetDirection = bed.facing;
    
    const doorInFront = space.doors.find(d => {
      const doorCenter = GeometryUtils.center(d);
      const bedCenter = GeometryUtils.center(bed);
      const bedFeetPoint: Point = {
        x: bedCenter.x,
        y: bedCenter.y + (feetDirection === 'south' ? bed.size.length / 2 : -bed.size.length / 2),
      };
      
      // 检查门是否在床尾方向
      return GeometryUtils.isFacing(bed, d) && GeometryUtils.distance(bedFeetPoint, doorCenter) < 0.4;
    });

    if (doorInFront) {
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'furniture', id: bed.id, name: '床' },
          { type: 'door', id: doorInFront.id, name: '房门' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('medium', '调整床的角度，避免正对门', 'move', 'moderate'),
          createFixSuggestion('low', '在门与床之间设置屏风或隔断', 'add', 'moderate'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则6: 横梁压床
const beamOverBedRule: Rule = {
  id: 'beam-over-bed',
  name: '横梁压床',
  description: '床的正上方有横梁经过',
  category: 'psychology',
  severity: 'critical',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '横梁形成压迫感，被认为会影响健康和运势',
  modernReason: '视觉上的压迫感可能影响心理状态，低矮的横梁还可能带来安全隐患',
  scoreImpact: 18,
  evaluate(space) {
    const bed = space.furnitures.find(f => f.category === 'bed');
    if (!bed) return null;

    const overheadBeam = space.structures.find(s => 
      s.type === 'beam' && 
      GeometryUtils.isAbove(bed, s as Rectangle, 0.05)
    );

    if (overheadBeam) {
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'furniture', id: bed.id, name: '床' },
          { type: 'structure', id: overheadBeam.id, name: '横梁' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('high', '移动床的位置，避开横梁下方', 'move', 'moderate'),
          createFixSuggestion('medium', '安装假天花板隐藏横梁', 'add', 'hard'),
          createFixSuggestion('medium', '使用蚊帐或床幔视觉上柔化横梁', 'add', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则7: 横梁压桌
const beamOverDeskRule: Rule = {
  id: 'beam-over-desk',
  name: '横梁压桌',
  description: '书桌或办公桌正上方有横梁',
  category: 'psychology',
  severity: 'warning',
  applicableRoomTypes: ['study', 'office', 'bedroom'],
  traditionalReason: '工作区域上方有压迫感，影响思维和决策',
  modernReason: '视觉压迫感增加工作压力，可能影响专注度和舒适度',
  scoreImpact: 12,
  evaluate(space) {
    const desks = space.furnitures.filter(f => f.category === 'desk');
    
    for (const desk of desks) {
      const overheadBeam = space.structures.find(s => 
        s.type === 'beam' && 
        GeometryUtils.isAbove(desk, s as Rectangle, 0.05)
      );

      if (overheadBeam) {
        return {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          category: this.category,
          affectedItems: [
            { type: 'furniture', id: desk.id, name: '书桌' },
            { type: 'structure', id: overheadBeam.id, name: '横梁' },
          ],
          traditionalReason: this.traditionalReason,
          modernReason: this.modernReason,
          fixSuggestions: [
            createFixSuggestion('high', '调整书桌位置，避开横梁', 'move', 'easy'),
            createFixSuggestion('medium', '使用台式台灯分散注意力', 'add', 'easy'),
            createFixSuggestion('low', '安装局部吊顶隐藏横梁', 'add', 'hard'),
          ],
          scoreImpact: this.scoreImpact,
        };
      }
    }
    return null;
  },
};

// 规则8: 书桌背门
const deskBackToDoorRule: Rule = {
  id: 'desk-back-to-door',
  name: '书桌背门',
  description: '人坐在书桌前时，背对着门，看不到门口动静',
  category: 'psychology',
  severity: 'warning',
  applicableRoomTypes: ['study', 'office', 'bedroom'],
  traditionalReason: '背后无靠，缺乏安全感，易受惊吓',
  modernReason: '无法感知身后来人，容易被打断且缺乏安全感，影响专注',
  scoreImpact: 14,
  evaluate(space) {
    const desks = space.furnitures.filter(f => f.category === 'desk');
    
    for (const desk of desks) {
      if (!desk.facing) continue;

      // 找到书桌正后方的门
      const backDirection = GeometryUtils.getOppositeDirection(desk.facing);
      
      const doorBehind = space.doors.find(d => {
        const deskCenter = GeometryUtils.center(desk);
        const doorCenter = GeometryUtils.center(d);
        
        // 检查门是否在书桌后方
        const isBehind = (() => {
          switch (backDirection) {
            case 'north': return doorCenter.y < deskCenter.y;
            case 'south': return doorCenter.y > deskCenter.y;
            case 'east': return doorCenter.x > deskCenter.x;
            case 'west': return doorCenter.x < deskCenter.x;
            default: return false;
          }
        })();
        
        const closeEnough = GeometryUtils.distance(deskCenter, doorCenter) < 0.5;
        return isBehind && closeEnough;
      });

      if (doorBehind) {
        return {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          category: this.category,
          affectedItems: [
            { type: 'furniture', id: desk.id, name: '书桌' },
            { type: 'door', id: doorBehind.id, name: '门' },
          ],
          traditionalReason: this.traditionalReason,
          modernReason: this.modernReason,
          fixSuggestions: [
            createFixSuggestion('high', '调整书桌方向，面向或侧向门', 'move', 'easy'),
            createFixSuggestion('medium', '在桌边放置镜子反射门口', 'add', 'easy'),
            createFixSuggestion('low', '使用高背椅增加后方支撑感', 'replace', 'moderate'),
          ],
          scoreImpact: this.scoreImpact,
        };
      }
    }
    return null;
  },
};

// 规则9: 书桌正对厕所门
const deskFacingToiletRule: Rule = {
  id: 'desk-facing-toilet',
  name: '书桌正对厕所门',
  description: '书桌正对卫生间门',
  category: 'health',
  severity: 'warning',
  applicableRoomTypes: ['study', 'office', 'bedroom'],
  traditionalReason: '卫生间湿气与秽气直冲工作区，不利于健康和思维',
  modernReason: '卫生间湿气、异味和细菌可能影响工作环境，且视觉上不舒适',
  scoreImpact: 15,
  evaluate(space) {
    const desks = space.furnitures.filter(f => f.category === 'desk');
    
    for (const desk of desks) {
      if (!desk.facing) continue;

      // 简化判断：假设 leadsTo 包含 'bathroom' 或 'toilet' 的是厕所门
      const toiletDoor = space.doors.find(d => 
        d.leadsTo?.toLowerCase().includes('bathroom') ||
        d.leadsTo?.toLowerCase().includes('toilet') ||
        d.leadsTo?.toLowerCase().includes('wc')
      );

      if (toiletDoor && GeometryUtils.isFacing(desk, toiletDoor)) {
        return {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          category: this.category,
          affectedItems: [
            { type: 'furniture', id: desk.id, name: '书桌' },
            { type: 'door', id: toiletDoor.id, name: '卫生间门' },
          ],
          traditionalReason: this.traditionalReason,
          modernReason: this.modernReason,
          fixSuggestions: [
            createFixSuggestion('high', '调整书桌方向，避开正对', 'move', 'easy'),
            createFixSuggestion('medium', '常关卫生间门，加装排气扇', 'add', 'easy'),
            createFixSuggestion('medium', '在两者之间放置绿植或屏风', 'add', 'moderate'),
          ],
          scoreImpact: this.scoreImpact,
        };
      }
    }
    return null;
  },
};

// 规则10: 厨房紧邻卧室床头墙
const kitchenNextToBedRule: Rule = {
  id: 'kitchen-next-to-bed',
  name: '厨房紧邻卧室床头墙',
  description: '卧室床头墙的另一侧是厨房，或厨房与卧室共用一面墙且床头紧贴',
  category: 'health',
  severity: 'critical',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '厨房火气燥热，紧邻床头影响睡眠质量和健康',
  modernReason: '厨房噪音、油烟和热量通过墙体传导，影响睡眠环境',
  scoreImpact: 20,
  evaluate(space) {
    // 此规则需要知道相邻房间信息，简化实现：
    // 如果 userNotes 中提到厨房在床头墙后，则触发
    if (space.userNotes?.painPoints.some(p => 
      p.includes('厨房') && (p.includes('床头') || p.includes('隔壁'))
    )) {
      const bed = space.furnitures.find(f => f.category === 'bed');
      if (!bed) return null;

      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'furniture', id: bed.id, name: '床' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('high', '调整床的位置，远离共用墙', 'move', 'moderate'),
          createFixSuggestion('high', '在共用墙加装隔音隔热材料', 'add', 'hard'),
          createFixSuggestion('medium', '使用厚窗帘和地毯吸收噪音', 'add', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则11: 动线穿堂
const circulationCrossingRule: Rule = {
  id: 'circulation-crossing',
  name: '动线穿堂',
  description: '主要动线直接穿越休息区或工作区',
  category: 'circulation',
  severity: 'warning',
  applicableRoomTypes: 'all',
  traditionalReason: '气流直冲休息区，影响稳定性和隐私',
  modernReason: '频繁的人流打断休息或工作，缺乏边界感，影响舒适度',
  scoreImpact: 12,
  evaluate(space) {
    const entrance = space.doors.find(d => d.type === 'entrance');
    if (!entrance) return null;

    // 找到主要的内部出口（如阳台门、通往其他房间的门）
    const mainExit = space.doors.find(d => 
      d.type !== 'entrance' && 
      (d.type === 'sliding' || d.leadsTo)
    );
    if (!mainExit) return null;

    // 检查动线是否穿过休息区或工作区
    const entranceCenter = GeometryUtils.center(entrance);
    const exitCenter = GeometryUtils.center(mainExit);

    const affectedZone = space.zones.find(zone => {
      if (zone.type !== 'sleep' && zone.type !== 'work' && zone.type !== 'rest') return false;
      
      // 检查动线是否穿过该区域
      return GeometryUtils.doesPathCrossZone(entranceCenter, exitCenter, zone);
    });

    if (affectedZone) {
      const zoneNames: Record<string, string> = {
        sleep: '睡眠区',
        work: '工作区',
        rest: '休息区',
      };

      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [
          { type: 'door', id: entrance.id, name: '入户门' },
          { type: 'door', id: mainExit.id, name: '出口' },
          { type: 'zone', id: affectedZone.id, name: zoneNames[affectedZone.type] || '功能区' },
        ],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('medium', '重新规划家具布局，避免动线穿越核心区域', 'move', 'hard'),
          createFixSuggestion('medium', '使用屏风、书架或家具创造视觉和物理分隔', 'add', 'moderate'),
          createFixSuggestion('low', '铺设不同材质的地毯区分功能区和通道', 'add', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};

// 规则12: 工位背后空且采光差
const workstationPoorLightRule: Rule = {
  id: 'workstation-poor-light',
  name: '工位背后空且采光差',
  description: '工位背后是开放空间或过道，且工作面采光不足',
  category: 'comfort',
  severity: 'warning',
  applicableRoomTypes: ['office', 'study'],
  traditionalReason: '缺乏靠山且光线不足，影响工作状态和效率',
  modernReason: '视线干扰多且照明不足，导致眼疲劳和注意力分散',
  scoreImpact: 14,
  evaluate(space) {
    const desks = space.furnitures.filter(f => f.category === 'desk');
    
    for (const desk of desks) {
      if (!desk.facing) continue;

      const deskCenter = GeometryUtils.center(desk);
      const backDirection = GeometryUtils.getOppositeDirection(desk.facing);
      
      // 检查背后是否开放（没有靠墙）
      const hasWallBehind = space.zones.some(z => 
        z.type === 'storage' || 
        (Math.abs(z.position.y - deskCenter.y) < 0.1 && z.size.length > 0.1)
      );

      // 检查采光（简化：检查是否有窗户在侧面或前方）
      const hasGoodLight = space.windows.some(w => {
        const windowRect = w as Rectangle;
        const windowCenter = GeometryUtils.center(windowRect);
        const dist = GeometryUtils.distance(deskCenter, windowCenter);
        return dist < 0.5 && w.facing !== backDirection;
      });

      if (!hasWallBehind && !hasGoodLight) {
        return {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          category: this.category,
          affectedItems: [
            { type: 'furniture', id: desk.id, name: '工位' },
          ],
          traditionalReason: this.traditionalReason,
          modernReason: this.modernReason,
          fixSuggestions: [
            createFixSuggestion('high', '增加桌面台灯，确保工作面照度充足', 'add', 'easy'),
            createFixSuggestion('medium', '在身后设置文件柜或隔断增加依靠感', 'add', 'moderate'),
            createFixSuggestion('medium', '调整工位方向，面向或侧向窗户', 'move', 'moderate'),
          ],
          scoreImpact: this.scoreImpact,
        };
      }
    }
    return null;
  },
};

// ==================== 规则引擎 ====================

export class RuleEngine {
  private rules: Rule[] = [];

  constructor() {
    this.registerDefaultRules();
  }

  // 注册默认规则
  private registerDefaultRules() {
    this.register(
      doorToBedroomDoorRule,
      doorToWindowRule,
      mirrorFacingBedRule,
      bedAgainstWindowRule,
      bedFeetToDoorRule,
      beamOverBedRule,
      beamOverDeskRule,
      deskBackToDoorRule,
      deskFacingToiletRule,
      kitchenNextToBedRule,
      circulationCrossingRule,
      workstationPoorLightRule
    );
  }

  // 注册规则
  register(...rules: Rule[]) {
    this.rules.push(...rules);
  }

  // 获取所有规则
  getAllRules(): Rule[] {
    return [...this.rules];
  }

  // 获取适用于特定房间类型的规则
  getRulesForRoomType(roomType: string): Rule[] {
    return this.rules.filter(rule => 
      rule.applicableRoomTypes === 'all' || 
      rule.applicableRoomTypes.includes(roomType)
    );
  }

  // 执行所有适用规则
  analyze(space: SpaceLayout): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const applicableRules = this.getRulesForRoomType(space.roomType);

    for (const rule of applicableRules) {
      try {
        const violation = rule.evaluate(space);
        if (violation) {
          violations.push(violation);
        }
      } catch (error) {
        console.error(`Rule ${rule.id} evaluation failed:`, error);
      }
    }

    // 按严重程度排序
    const severityOrder = { critical: 0, warning: 1, suggestion: 2 };
    return violations.sort((a, b) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    );
  }

  // 计算空间评分
  calculateScore(space: SpaceLayout): {
    overall: number;
    byCategory: Record<string, number>;
  } {
    const violations = this.analyze(space);
    const maxScore = 100;
    let totalDeduction = 0;
    const categoryDeductions: Record<string, number> = {};

    violations.forEach(v => {
      totalDeduction += v.scoreImpact;
      categoryDeductions[v.category] = (categoryDeductions[v.category] || 0) + v.scoreImpact;
    });

    // 确保分数不低于0
    const overall = Math.max(0, maxScore - Math.min(totalDeduction, maxScore));
    
    const byCategory: Record<string, number> = {};
    const categories = ['layout', 'circulation', 'comfort', 'health', 'psychology'];
    categories.forEach(cat => {
      byCategory[cat] = Math.max(0, 100 - (categoryDeductions[cat] || 0));
    });

    return { overall, byCategory };
  }
}

// 导出单例实例
export const ruleEngine = new RuleEngine();

// 导出工具函数供测试使用
export { GeometryUtils };
