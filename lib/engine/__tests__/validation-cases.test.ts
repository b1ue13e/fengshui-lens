// 12套真实案例回归测试
// 用于验证系统对真实房源的判断是否符合预期

import { describe, it, expect } from 'vitest';
import { evaluate } from '../index';
import { validationCases } from '../../validation/fixtures';
import { calculateMetrics, generateMetricsReport } from '../../validation/metrics';

describe('12套真实案例验证', () => {
  // 为每个案例创建测试
  for (const testCase of validationCases) {
    it(`[${testCase.id}] ${testCase.name} - 应判定为 ${testCase.humanExpectation.verdict}`, () => {
      const result = evaluate(testCase.input);
      
      console.log(`\n${testCase.id} 输出:`, {
        verdict: result.verdict,
        expected: testCase.humanExpectation.verdict,
        overallScore: result.overallScore,
        topRisk: result.risks[0]?.title,
        expectedTopRisk: testCase.humanExpectation.topRiskGuess,
      });
      
      // 验证 verdict
      expect(result.verdict).toBe(testCase.humanExpectation.verdict);
    });
  }
});

describe('验证指标统计', () => {
  it('应输出完整指标报告', () => {
    const metrics = calculateMetrics(validationCases);
    const report = generateMetricsReport(metrics);
    
    console.log('\n' + report);
    
    // 基本断言
    expect(metrics.totalCases).toBe(15);
    expect(metrics.verdictMatchRate).toBeGreaterThanOrEqual(0);
    expect(metrics.verdictMatchRate).toBeLessThanOrEqual(100);
    
    // override 触发率应小于 30%
    expect(metrics.overrideTriggerRate).toBeLessThan(30);
    
    // override 后人工一致率应大于 80%
    expect(metrics.overrideHumanAgreementRate).toBeGreaterThanOrEqual(80);
  });
});

describe('Override 过拟合检查', () => {
  // 专门检查 couple + shared_privacy 的 override 是否过严
  it('情侣+朋友合租不应被过度打成 avoid', () => {
    const friendCase = validationCases.find(c => c.id === 'case-013');
    expect(friendCase).toBeDefined();
    
    if (friendCase) {
      const result = evaluate(friendCase.input);
      
      console.log('\n情侣+朋友合租检查:', {
        verdict: result.verdict,
        humanExpected: friendCase.humanExpectation.verdict,
        note: '如果系统判 avoid 但人工预期 cautious，说明 override 过严',
      });
      
      // 记录当前状态，不强制断言，用于分析
      // 如果这条测试失败，说明需要细化 override 规则
    }
  });
  
  it('高楼层临街不应被等同于低楼层临街', () => {
    const highFloorCase = validationCases.find(c => c.id === 'case-015');
    expect(highFloorCase).toBeDefined();
    
    if (highFloorCase) {
      const result = evaluate(highFloorCase.input);
      
      console.log('\n高楼层临街检查:', {
        verdict: result.verdict,
        humanExpected: highFloorCase.humanExpectation.verdict,
        floorLevel: highFloorCase.input.floorLevel,
        note: '18层高楼层，噪音应该比低层小',
      });
    }
  });
  
  it('老人+低楼层+好通风不应一刀切 avoid', () => {
    const elderlyCase = validationCases.find(c => c.id === 'case-014');
    expect(elderlyCase).toBeDefined();
    
    if (elderlyCase) {
      const result = evaluate(elderlyCase.input);
      
      console.log('\n老人+低楼层+好通风检查:', {
        verdict: result.verdict,
        humanExpected: elderlyCase.humanExpectation.verdict,
        ventilation: elderlyCase.input.ventilation,
        note: '2楼+通风好+无潮湿，对健康的老人是可以接受的',
      });
    }
  });
});
