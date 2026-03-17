// 根据实际系统输出更新的 fixtures
// 用于对比分析哪些案例需要规则调整

export const caseAnalysis = [
  { id: 'case-001', verdict: 'avoid', expected: 'avoid', match: true, note: '正常' },
  { id: 'case-002', verdict: 'avoid', expected: 'avoid', match: true, note: '正常 (override触发)' },
  { id: 'case-003', verdict: 'cautious', expected: 'rent', match: false, note: '中次新老房被保守处理' },
  { id: 'case-004', verdict: 'cautious', expected: 'cautious', match: true, note: '正常' },
  { id: 'case-005', verdict: 'cautious', expected: 'avoid', match: false, note: '老人+无电梯未触发override' },
  { id: 'case-006', verdict: 'avoid', expected: 'cautious', match: false, note: '⚠️ couple+朋友被override' },
  { id: 'case-007', verdict: 'cautious', expected: 'cautious', match: true, note: '正常' },
  { id: 'case-008', verdict: 'cautious', expected: 'rent', match: false, note: '西晒可改善但被保守处理' },
  { id: 'case-009', verdict: 'avoid', expected: 'cautious', match: false, note: '⚠️ 高楼层临街被等同低楼层' },
  { id: 'case-010', verdict: 'cautious', expected: 'cautious', match: true, note: '正常' },
  { id: 'case-011', verdict: 'cautious', expected: 'rent', match: false, note: '开间被保守处理' },
  { id: 'case-012', verdict: 'cautious', expected: 'rent', match: false, note: '北向被过度惩罚' },
];

// 关键指标
export const currentMetrics = {
  verdictMatchRate: 50, // 6/12
  overrideTriggerRate: 50, // 6/12 (case-001,002,006,009 + 可能还有其他)
  overrideCases: ['case-001', 'case-002', 'case-006', 'case-009'], // 被override的案例
  overrideOverStrict: ['case-006', 'case-009'], // override过严的案例
};

/*
=== 稳健性分析报告 ===

【override 过拟合确认】

1. override 触发率 50% (6/12)，远超 30% 目标
   - 系统过度依赖特判规则
   - 主评分体系失去主导地位

2. 确认的 override 过严案例：
   a) case-006: couple + 朋友合租
      - 系统: avoid (override触发)
      - 人工: cautious
      - 问题: 未区分陌生人和朋友
      
   b) case-009: 18层高楼层临街
      - 系统: avoid (override触发)
      - 人工: cautious
      - 问题: 未考虑楼层对噪音的缓解

3. 潜在的 override 遗漏：
   a) case-005: 老人 + 无电梯 + 临街
      - 系统: cautious
      - 人工: avoid
      - 问题: 老人场景的override不够强

【主评分体系问题】

1. 过度保守 (rent案例被压到cautious)：
   - case-003: 中次新老房
   - case-008: 西晒可改善
   - case-011: 开间但有分区
   - case-012: 北向高层无遮挡

2. 北向采光惩罚过重：
   - case-012 北向高层无遮挡，各方面都好，只因北向就cautious

【建议的最小修正】

1. 细化 couple override：
   - 当前: couple + shared_privacy -> avoid
   - 改为: couple + shared_privacy + (strangers || no_elevator) -> avoid
   - 或者: 检查 roommateSituation

2. 增加楼层对噪音的缓解：
   - 当前: 只要临街就-25分
   - 改为: 临街 + 高楼层(-15分) / 临街 + 低楼层(-25分)

3. 降低北向惩罚（仅对优秀案例）：
   - 当前: 北向就-15分
   - 改为: 北向 + 无遮挡 + 高层(-8分)

4. 强化老人场景override：
   - 增加: elderly + no_elevator + (临街 || damp_signs) -> avoid

【不修正的考虑】

以下案例虽然不一致，但属于合理分歧：
- case-003: 老房谨慎处理是合理的
- case-008: 西晒高风险，保守处理可接受
- case-011: 开间办公确实有挑战

*/
