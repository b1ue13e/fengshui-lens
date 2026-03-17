import { describe, it } from 'vitest';
import { evaluate } from '../index';
import { validationCases } from '../../validation/fixtures';

describe('排序问题诊断', () => {
  it('输出所有案例的排序详情', () => {
    console.log('\n=== 排序问题诊断报告 ===\n');
    
    for (const testCase of validationCases) {
      const result = evaluate(testCase.input);
      
      console.log(`\n--- ${testCase.id} (${testCase.scenario}) ---`);
      console.log(`人工TopRisk: ${testCase.humanExpectation.topRiskGuess}`);
      console.log(`系统TopRisk: ${result.risks[0]?.title || 'undefined'}`);
      console.log(`所有风险: ${result.risks.map(r => `${r.title}(${r.severity})`).join(', ') || '无'}`);
      
      console.log(`\n人工FirstAction: ${testCase.humanExpectation.firstActionGuess}`);
      console.log(`系统FirstAction: ${result.actions[0]?.title || 'undefined'}`);
      console.log(`所有动作: ${result.actions.map(a => `${a.title}(收益:${a.expectedBenefit.score},成本:${a.costLevel})`).join(', ') || '无'}`);
      
      // 判断Top Risk是否命中
      const systemTopRisk = result.risks[0]?.title || '';
      const humanTopRisk = testCase.humanExpectation.topRiskGuess;
      const topRiskHit = humanTopRisk.toLowerCase().includes(systemTopRisk.slice(0, 4).toLowerCase()) ||
                         systemTopRisk.toLowerCase().includes(humanTopRisk.slice(0, 4).toLowerCase()) ||
                         (systemTopRisk === '' && humanTopRisk.includes('无明显风险'));
      
      // 判断First Action是否可接受
      const systemFirstAction = result.actions[0]?.title || '';
      const humanFirstAction = testCase.humanExpectation.firstActionGuess;
      const actionAcceptable = humanFirstAction.toLowerCase().includes(systemFirstAction.slice(0, 4).toLowerCase()) ||
                              systemFirstAction.toLowerCase().includes(humanFirstAction.slice(0, 4).toLowerCase()) ||
                              testCase.humanExpectation.confidence === 'low';
      
      console.log(`\nTop Risk命中: ${topRiskHit ? '✅' : '❌'}`);
      console.log(`First Action可接受: ${actionAcceptable ? '✅' : '❌'}`);
    }
  });
});
