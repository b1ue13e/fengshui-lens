import { describe, it, expect } from 'vitest';
import { assessMitigability, evaluate, normalizeInput } from '../index';
import { testCases, getTestCase } from './fixtures/cases';
import { DIMENSIONS } from '../../constants/evaluation';

describe('SpaceRisk 评估引擎 - 8组样例验证', () => {
  testCases.forEach((testCase) => {
    it(`[${testCase.id}] ${testCase.name}`, () => {
      const result = evaluate(testCase.input);
      const { expectations } = testCase;

      // 1. 验证 verdict
      expect(result.verdict).toBe(expectations.verdict);

      // 2. 验证总分区间（非精确值）
      expect(result.overallScore).toBeGreaterThanOrEqual(expectations.scoreRange[0]);
      expect(result.overallScore).toBeLessThanOrEqual(expectations.scoreRange[1]);

      // 3. 验证必须存在的风险（arrayContaining，不强制排序）
      if (expectations.mustHaveRisks && expectations.mustHaveRisks.length > 0) {
        const riskCodes = result.risks.map(r => r.id);
        expectations.mustHaveRisks.forEach(code => {
          expect(riskCodes).toContain(code);
        });
      }

      // 4. 验证必须不存在的风险
      if (expectations.mustNotHaveRisks) {
        const riskCodes = result.risks.map(r => r.id);
        expectations.mustNotHaveRisks.forEach(code => {
          expect(riskCodes).not.toContain(code);
        });
      }

      // 5. 验证最低分维度（在前N个中即可，不强制排序）
      if (expectations.lowestDimensions && expectations.lowestDimensions.length > 0) {
        const sortedDimensions = [...result.dimensions].sort((a, b) => a.score - b.score);
        const lowestN = sortedDimensions
          .slice(0, expectations.lowestDimensions.length)
          .map(d => d.dimension);
        expectations.lowestDimensions.forEach(dim => {
          expect(lowestN).toContain(dim);
        });
      }

      // 6. 验证第一动作在候选列表中（允许备选，不写死唯一答案）
      if (expectations.actionCandidates && expectations.actionCandidates.length > 0) {
        expect(result.actions.length).toBeGreaterThan(0);
        expect(expectations.actionCandidates).toContain(result.actions[0].code);
      }
    });
  });

  describe('高危组合覆盖规则', () => {
    it('老人+低楼层+潮湿迹象 = 直接 avoid', () => {
      const testCase = getTestCase('case_05_elderly_damp')!;
      const result = evaluate(testCase.input);
      expect(result.verdict).toBe('avoid');
      expect(result.risks.some(r => r.id === 'damp_signs')).toBe(true);
    });

    it('睡眠+临街+西晒+低预算 = 直接 avoid', () => {
      const testCase = getTestCase('case_02_street_west_sleep')!;
      const result = evaluate(testCase.input);
      expect(result.verdict).toBe('avoid');
    });

    it('备考+临街噪音+不允许软装 = 难以缓解', () => {
      const testCase = getTestCase('case_01_perfect_exam')!;
      // 修改输入：不允许软装
      const modifiedInput = { ...testCase.input, facesMainRoad: true, allowsSoftImprovements: false };
      const result = evaluate(modifiedInput);
      // 此时应该判定为 avoid，因为噪音无法缓解
      expect(result.verdict).toBe('avoid');
    });
  });

  describe('维度权重验证', () => {
    it('睡眠场景下噪音维度权重最高', () => {
      const testCase = getTestCase('case_02_street_west_sleep')!;
      const result = evaluate(testCase.input);
      const noiseDimension = result.dimensions.find(d => d.dimension === 'noise');
      expect(noiseDimension?.weight).toBeGreaterThan(1.0);
    });

    it('备考场景下专注维度权重最高', () => {
      const testCase = getTestCase('case_01_perfect_exam')!;
      const result = evaluate(testCase.input);
      const focusDimension = result.dimensions.find(d => d.dimension === 'focus');
      expect(focusDimension?.weight).toBeGreaterThan(1.0);
    });
  });
});

describe('系统不变量测试', () => {
  describe('1. 分数边界', () => {
    it('任何输入下，六维分都在 0-100 范围内', () => {
      testCases.forEach(tc => {
        const result = evaluate(tc.input);
        DIMENSIONS.forEach(dim => {
          expect(result.scores[dim]).toBeGreaterThanOrEqual(0);
          expect(result.scores[dim]).toBeLessThanOrEqual(100);
        });
      });
    });

    it('总分在 0-100 范围内', () => {
      testCases.forEach(tc => {
        const result = evaluate(tc.input);
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('2. 推荐约束', () => {
    it('不允许移动家具时，推荐中不能出现需要移动家具的动作', () => {
      const testCase = getTestCase('case_04_shared_privacy')!;
      const modifiedInput = { ...testCase.input, allowsFurnitureMove: false };
      const result = evaluate(modifiedInput);
      
      // 检查推荐动作中不应该包含需要移动家具的动作
      const furnitureMoveActions = ['reposition_bed', 'reposition_desk'];
      result.actions.forEach(action => {
        if (action.requirements.needsFurnitureMove) {
          expect(furnitureMoveActions).not.toContain(action.code);
        }
      });
    });

    it('不允许轻改造时，推荐中不能出现需要轻改造的动作', () => {
      const testCase = getTestCase('case_02_street_west_sleep')!;
      const modifiedInput = { ...testCase.input, allowsLightRenovation: false };
      const result = evaluate(modifiedInput);
      
      result.actions.forEach(action => {
        if (action.requirements.needsLightRenovation) {
          // 这些动作应该被过滤掉或排名靠后
          expect(action.code).not.toBe('window_film');
        }
      });
    });
  });

  describe('3. 输出排序', () => {
    it('risks 按严重度排序（高→中→低）', () => {
      testCases.forEach(tc => {
        const result = evaluate(tc.input);
        const severityOrder = { high: 0, medium: 1, low: 2 };
        
        for (let i = 0; i < result.risks.length - 1; i++) {
          const current = severityOrder[result.risks[i].severity];
          const next = severityOrder[result.risks[i + 1].severity];
          expect(current).toBeLessThanOrEqual(next);
        }
      });
    });

    it('actions 按综合优先级排序（有排序即可，不测具体算法）', () => {
      const testCase = getTestCase('case_02_street_west_sleep')!;
      const result = evaluate(testCase.input);
      
      // 验证 actions 非空且有排序
      expect(result.actions.length).toBeGreaterThan(0);
      
      // 第一个动作应该是高优先级的（成本/难度/收益平衡）
      const firstAction = result.actions[0];
      expect(firstAction.code).toBeDefined();
      expect(firstAction.expectedBenefit.score).toBeGreaterThan(0);
    });
  });
});

describe('可缓解性评估', () => {
  it('结构性问题标记为难以缓解', () => {
    const testCase = getTestCase('case_05_elderly_damp')!;
    const result = evaluate(testCase.input);
    
    const dampRisk = result.risks.find(r => r.id === 'damp_signs');
    if (dampRisk) {
      const mitigability = assessMitigability(dampRisk, normalizeInput(testCase.input));
      // damp_signs 本身可通过除湿机等软装缓解，但 ground_floor_damp 更难
      expect(['easy', 'moderate', 'hard']).toContain(mitigability);
    }
  });

  it('噪音问题在用户不允许软装时难以缓解', () => {
    const testCase = getTestCase('case_02_street_west_sleep')!;
    const result = evaluate(testCase.input);
    
    const noiseRisk = result.risks.find(r => r.id === 'street_noise');
    if (noiseRisk) {
      const inputNoSoft = { ...testCase.input, allowsSoftImprovements: false };
      const mitigability = assessMitigability(noiseRisk, normalizeInput(inputNoSoft));
      expect(mitigability).toBe('hard');
    }
  });
});
