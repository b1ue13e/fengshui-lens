> 历史归档说明：这是旧产品阶段的历史文档。当前主产品已演进为“青年大学习”，文中描述的能力现作为“租房工具专区”的高级模块保留。

# SpaceRisk 使用指南

## 一句话说明

SpaceRisk 当前为**保守策略版租房决策辅助引擎**：优先避免放过高风险房源，在当前验证案例中 verdict 表现稳定，但风险排序与第一建议动作仍在持续校准中。

---

## 核心口径（三句）

1. **当前版本是"保守策略版"的租房决策辅助引擎。**

2. **系统优先保证 verdict 稳定性，其次再优化风险排序和建议排序。**

3. **decisionNote 用于表达结构性缺陷或低改造收益场景，不参与 action card 排序。**

---

## 程序化调用

```typescript
import { evaluate } from '@/lib/engine';

const result = evaluate({
  // 房源基本信息
  layoutType: 'one_bedroom',
  areaSqm: 45,
  orientation: 'south',
  floorLevel: 'middle', // 'low' | 'middle' | 'high'
  totalFloors: 18,
  hasElevator: true,
  buildingAge: 'new', // 'old' | 'medium' | 'new'
  
  // 空间细节
  hasWestFacingWindow: false,
  facesMainRoad: true,        // 是否临街
  nearElevator: false,        // 是否靠近电梯
  isShared: false,            // 是否合租
  // roommateSituation 仅在 isShared=true 时设置
  roommateSituation: undefined,
  
  // 使用场景（关键）
  primaryGoal: 'exam_prep', // 'sleep_quality' | 'exam_prep' | 'wfh' | 'couple' | 'elderly_safety'
  
  // 改造意愿
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
});

// 返回结果
{
  verdict: 'avoid' | 'cautious' | 'rent',
  overallScore: 65,
  risks: [...],               // Top 3 风险
  actions: [...],             // Top 3 建议动作
  decisionNote?: {...},       // 结构性缺陷提示（如有）
  dimensions: [...],
  scores: {...},
}
```

---

## Next.js App Router 集成

```typescript
// app/listing/[id]/page.tsx
import { evaluate } from '@/lib/engine';
import { transformRawToEngineInput } from '@/lib/adapters/listing-transformer';
import { DecisionNoteCard } from '@/components/ui/decision-note';
import { FeedbackMicro } from '@/components/ui/feedback-micro';

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 1. 获取房源数据（API/爬虫/数据库）
  const rawListing = await fetchListing(id);
  
  // 2. 清洗为标准输入（防波堤）
  const input = transformRawToEngineInput(rawListing, {
    primaryGoal: 'sleep_quality'
  });
  
  // 3. 执行评估
  const evaluation = evaluate(input);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* 核心判定 */}
      <VerdictBadge 
        verdict={evaluation.verdict} 
        score={evaluation.overallScore} 
      />
      
      {/* Decision Note - 结构性缺陷提示 */}
      {evaluation.decisionNote && (
        <DecisionNoteCard note={evaluation.decisionNote} />
      )}
      
      {/* Top 风险 */}
      <RiskList risks={evaluation.risks} />
      
      {/* 建议动作 */}
      <ActionList actions={evaluation.actions} />
      
      {/* 反馈收集（仅 cautious） */}
      {evaluation.verdict === 'cautious' && (
        <FeedbackMicro 
          logId={id}
          topRiskTitle={evaluation.risks[0]?.title}
        />
      )}
    </div>
  );
}
```

---

## 当前相对稳定的能力

- **verdict 判定**：在当前验证案例中表现稳定，适合作为保守型租房决策参考
- **override 规则**：触发率较低，当前验证案例中未出现明显误杀
- **Decision Note**：可用于标记结构性缺陷或低改造收益场景，独立于 action 排序
- **场景排序**：老人 / 备考 / 睡眠等场景下，风险与建议已具备基础场景适配能力

---

## 当前版本边界

- **依赖结构化输入**：当前不直接读取真实房源页面，需要先将房源信息转换为引擎输入
- **Decision Note 前端展示未完整接入**：引擎已输出，但正式报告页仍建议补充独立提示卡
- **风险排序仍在继续校准**：目前 Top Risk 与 First Action 的质量仍弱于 verdict
- **部分规则覆盖仍不完整**：例如北向采光不足等场景仍有补充空间

---

## 开发调试

访问 `/dev/cases` 查看15套验证案例，支持：
- 案例对比（系统输出 vs 人工预期）
- Decision Note 触发检查
- 排序调试

```bash
# 运行全部测试
npm test

# 查看排序校准结果
npx vitest run lib/engine/__tests__/sorting-calibration.test.ts --reporter=verbose
```

---

## 接入建议

1. **标注版本性质**：
   > "当前为保守策略版，宁可 cautious 不租，也不误杀好房。"

2. **优先展示 Decision Note**：
   - 在报告页独立区域展示（不要混入 action card）
   - 橙色/黄色区分严重程度

3. **收集用户反馈**：
   - 对 cautious verdict 的房源，询问实际满意度
   - 用于后续校准 rent 阈值

---

**系统状态**：可标注为"保守策略版"投入使用
