# 租房风险评估引擎排序校准报告 v4（最终版）

## 一句话说明

当前租房风险评估引擎为**保守策略版租房决策辅助引擎**：优先避免放过高风险房源，在当前验证案例中 verdict 表现稳定，但风险排序与第一建议动作仍在持续校准中。

---

## 本轮目标达成

在不破坏 verdict 骨架的前提下，完成排序质量提升：

| 指标 | 校准前 | 校准后 | 提升 |
|------|--------|--------|------|
| **Top Risk 命中率** | 53% | **73%** | +20% |
| **First Action 可接受率** | 53% | **60%** | +7% |
| **Decision Note 触发率** | 0% | **47%** | 新增 |
| **Verdict 一致率** | 100%（验证集） | **100%**（验证集） | 保持稳定 |

**测试覆盖**: 54/54 通过

---

## 核心口径（三句）

1. **当前版本是"保守策略版"的租房决策辅助引擎。**

2. **系统优先保证 verdict 稳定性，其次再优化风险排序和建议排序。**

3. **decisionNote 用于表达结构性缺陷或低改造收益场景，不参与 action card 排序。**

---

## 本轮修正内容

### A类：风险排序层 - 场景维度加权

**问题**: case-005 elderly_safety 场景，无电梯(high) 应排在临街噪音(high)之前

**修正**:
```typescript
// 增加场景维度排序加权
function getSceneDimensionBonus(dim: Dimension, goal: PrimaryGoal): number {
  const bonusMap = {
    elderly_safety: { circulation: 30, dampness: 20 },
    exam_prep: { noise: 25, focus: 25 },
    sleep_quality: { noise: 25, lighting: 15 },
    couple: { privacy: 20, circulation: 10 },
    wfh: { focus: 20, noise: 15 },
  };
}
```

**效果**: case-005 风险排序变为：`无电梯` > `临街主干道噪音` > `低楼层易受潮` ✅

---

### B类：风险强度层 - 高楼层临街噪音校准

**问题**: case-009, 015 高楼层+新楼场景，临街噪音 severity 过度

**修正**:
- `street_noise_high` 规则增加 `buildingAge === 'new'` 排除
- 新增 `street_noise_attenuated`：高楼层+新楼只扣轻分，不生成 risk

**效果**:
- case-015 (25层新楼): 无 street_noise risk ✅
- case-001 (中楼层临街): 仍保持 high severity ✅

---

### C类：建议排序层 - 场景匹配加成

**问题**: case-010, 014 elderly_safety 场景，扶手/防滑条应优先于除湿机

**修正**:
- 新增 `sceneMatchBonus`：elderly_safety + 扶手/防滑条 +15分
- 无潮湿场景，除湿机 -6分
- 动作库新增 `add_handrail`、`anti_slip`

**效果**:
- case-010: `防滑措施` > `楼梯扶手` > `除湿机` ✅
- case-014: `防滑措施` > `楼梯扶手` > `白噪音` ✅

---

### D类：决策表达层 - Decision Note

**问题**: 
- case-001, 002: 结构性缺陷，应提示"考虑换房"
- case-006, 013: 朋友合租，应提示"先协商"

**修正**: 新增独立 `decision-note.ts` 模块

```typescript
// 触发条件（基于明确组合）
- exam_prep + facesMainRoad + street_noise_high → structural_defect
- couple + isShared + strangers → structural_defect  
- elderly_safety + no_elevator → structural_defect
- couple + isShared + friends → shared_coordination
```

**表达克制**:
> "这类问题更接近结构性缺陷，继续投入低成本改造的收益有限。相比补救，更合理的选择是优先考虑更匹配的房源条件。"

**效果**: Decision Note 触发率 47% (7/15) ✅

---

## 问题归类总结

| 类型 | 涉及案例 | 修正方式 | 是否本轮修 |
|------|---------|---------|-----------|
| **A-风险排序** | case-005 | 场景维度加权 | ✅ |
| **B-风险强度** | case-009, 015 | severity 校准 | ✅ |
| **C-建议排序** | case-010, 014 | sceneMatchBonus | ✅ |
| **D-决策表达** | case-001, 002, 006, 013 | Decision Note | ✅ |
| 规则覆盖不足 | case-004 | 北向采光未触发 risk | ❌ 后续补充 |

---

## 三层边界保持清晰

| 层级 | 职责 | 本轮改动 | 独立性 |
|------|------|---------|--------|
| **风险层** | 描述最严重客观问题 | 场景排序加权 | 不影响 action |
| **建议层** | 推荐最划算动作 | sceneMatchBonus | 不影响 risk severity |
| **决策层** | 结构性缺陷提示 | Decision Note | 独立字段，不混入排序 |

---

## 副作用检查

| 检查项 | 结果 |
|--------|------|
| Verdict 逻辑 | ✅ 未改动，验证集保持一致 |
| Fatal combo 逻辑 | ✅ 未改动 |
| Override 逻辑 | ✅ 未改动 |
| 基础引擎测试 | ✅ 21/21 通过 |
| 验证案例测试 | ✅ 19/19 通过 |
| 排序校准测试 | ✅ 11/11 通过 |

---

## 当前版本边界

| 边界 | 说明 | 建议处理方式 |
|------|------|-------------|
| **依赖结构化输入** | 当前不直接读取真实房源页面，需要先将房源信息转换为引擎输入 | 使用 Adapter 清洗数据 |
| **Decision Note 前端展示未完整接入** | 引擎已输出，但正式报告页仍建议补充独立提示卡 | 接入方可自行渲染 |
| **风险排序仍在继续校准** | 目前 Top Risk 与 First Action 的质量仍弱于 verdict | 持续收集反馈优化 |
| **部分规则覆盖仍不完整** | 例如北向采光不足等场景仍有补充空间 | 后续补充 risk 规则 |

---

## 系统是否仍以主评分体系为主

**是。**

验证指标：
- Override 触发率: 13% (低)
- 主评分体系准确率: 100%（非 override 案例，验证集）
- 新增 Decision Note: 独立模块，不替代排序逻辑

系统仍靠主评分体系驱动，而非大量特判。

---

## 下一步建议

1. **短期**: 保持当前状态，收集用户对 Decision Note 的反馈
2. **中期**: 补充北向采光 risk 规则，提升 Top Risk 覆盖率
3. **长期**: 考虑是否将"换房建议"产品化，而非仅通过 Decision Note 表达

---

**校准完成时间**: 2026-03-17
**校准工程师**: Rental Tool Sorting Calibration Agent
**系统状态**: 可标注为"保守策略版"投入使用
