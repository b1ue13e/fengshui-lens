# SpaceRisk 最终报告：三阶段实现完成

## 一句话说明

SpaceRisk 当前为**保守策略版租房决策辅助引擎**：优先避免放过高风险房源，在当前验证案例中 verdict 表现稳定，但风险排序与第一建议动作仍在持续校准中。

---

## 三阶段实现概览

| 阶段 | 状态 | 核心交付 |
|------|------|---------|
| **阶段一** | ✅ 完成 | Decision Note UI 组件（高质感警示卡片） |
| **阶段二** | ✅ 完成 | 真实数据清洗 Adapter（防波堤建设） |
| **阶段三** | ✅ 完成 | 反馈闭环机制（影子模式+微交互） |

---

## 核心口径（三句）

1. **当前版本是"保守策略版"的租房决策辅助引擎。**

2. **系统优先保证 verdict 稳定性，其次再优化风险排序和建议排序。**

3. **decisionNote 用于表达结构性缺陷或低改造收益场景，不参与 action card 排序。**

---

## 指标验证

| 指标 | 校准前 | 校准后 | 状态 |
|------|--------|--------|------|
| Top Risk 命中率 | 53% | **73%** | ✅ 提升 |
| First Action 可接受率 | 53% | **60%** | ✅ 提升 |
| Decision Note 触发率 | 0% | **47%** | ✅ 新增 |
| Verdict 一致率（验证集） | 100% | **100%** | ✅ 稳定 |
| 测试通过率 | - | **54/54** | ✅ 通过 |

---

## 当前相对稳定的能力

- **verdict 判定**：在当前验证案例中表现稳定，适合作为保守型租房决策参考
- **override 规则**：触发率较低，当前验证案例中未出现明显误杀
- **Decision Note**：可用于标记结构性缺陷或低改造收益场景，独立于 action 排序
- **场景排序**：老人 / 备考 / 睡眠等场景下，风险与建议已具备基础场景适配能力

---

## 当前版本边界

| 边界 | 说明 | 建议处理方式 |
|------|------|-------------|
| **依赖结构化输入** | 当前不直接读取真实房源页面，需要先将房源信息转换为引擎输入 | 使用 Adapter 清洗数据 |
| **Decision Note 前端展示未完整接入** | 引擎已输出，但正式报告页仍建议补充独立提示卡 | 接入方可自行渲染 |
| **风险排序仍在继续校准** | 目前 Top Risk 与 First Action 的质量仍弱于 verdict | 持续收集反馈优化 |
| **部分规则覆盖仍不完整** | 例如北向采光不足等场景仍有补充空间 | 后续补充 risk 规则 |

---

## 快速接入

### 1. 基础评估

```typescript
import { evaluate } from '@/lib/engine';

const result = evaluate({
  layoutType: 'one_bedroom',
  areaSqm: 45,
  orientation: 'south',
  floorLevel: 'middle',
  totalFloors: 18,
  hasElevator: true,
  buildingAge: 'new',
  facesMainRoad: true,
  isShared: false,
  // roommateSituation 仅在 isShared=true 时设置
  roommateSituation: undefined,
  primaryGoal: 'exam_prep',
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
});

// result.decisionNote?.title // "结构性缺陷提示"
```

### 2. 接入脏数据

```typescript
import { transformRawToEngineInput } from '@/lib/adapters/listing-transformer';

const rawData = await crawlListing(url);
const input = transformRawToEngineInput(rawData, { 
  primaryGoal: 'sleep_quality' 
});
const result = evaluate(input);
```

### 3. 展示 Decision Note

```tsx
import { DecisionNoteCard } from '@/components/ui/decision-note';

{result.decisionNote && (
  <DecisionNoteCard note={result.decisionNote} />
)}
```

### 4. 收集用户反馈

```tsx
import { FeedbackMicro } from '@/components/ui/feedback-micro';

{result.verdict === 'cautious' && (
  <FeedbackMicro 
    logId={logId}
    topRiskTitle={result.risks[0]?.title}
  />
)}
```

---

## 下一步建议

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | 部署并监控 Shadow Log | 确认生产环境日志接收正常 |
| P1 | 收集用户反馈数据 | 观察 FeedbackMicro 使用率 |
| P2 | 接入真实房源 API | 使用 Adapter 清洗数据 |
| P2 | 基于反馈数据调优 | 当收集到 50+ 条负反馈时 |
| P3 | 自动测试集扩充 | 将高置信度负反馈转为测试用例 |

---

## 测试命令

```bash
# 运行全部测试
npm test

# 查看排序校准结果
npx vitest run lib/engine/__tests__/sorting-calibration.test.ts --reporter=verbose
```

---

**系统状态**: ✅ **三阶段全部完成，可标注为"保守策略版"投入使用**

**核心判断**: 当前 verdict 稳定性高于风险排序稳定性。系统已经较擅长给出保守结论，但在"最该优先关注的风险"和"第一建议动作"上，仍有进一步校准空间。
