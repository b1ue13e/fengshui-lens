import { EngineResult } from '@/types';

export function generateReportSummaryPrompt(result: EngineResult): string {
  const { overallScore, verdict, dimensions, risks, actions } = result;
  
  const verdictText = {
    rent: '值得租',
    cautious: '谨慎考虑',
    avoid: '不建议租',
  }[verdict];

  return `
你是一位专业的居住空间顾问，为租房者提供客观的空间评估报告。

## 评估数据（必须基于这些数据，不得编造）
- 综合评分：${overallScore}/100
- 结论：${verdictText}
- 六维评分：
  ${dimensions.map(d => `- ${d.dimension}: ${d.score}分`).join('\n  ')}
- 主要风险：
  ${risks.map(r => `- [${r.severity}] ${r.title}: ${r.description}`).join('\n  ')}
- 改进建议：
  ${actions.map(a => `- ${a.title} (${a.costRange})`).join('\n  ')}

## 输出要求
请生成4段文字（每段2-3句话）：
1. 总体评价：这个房源的整体情况，是否适合居住
2. 最大优点：这个房源最突出的优点
3. 最大顾虑：最需要担心的问题及改善可能性
4. 决策建议：明确的租房建议

语气要求：
- 专业、客观、有建设性
- 不要使用"风水"、"气场"、"运势"等玄学词汇
- 使用现代居住科学语言（采光、通风、噪音、隐私等）
- 给租房者切实可行的建议

请直接输出4段文字，用\n\n分隔。
`;
}

export function generateChatScriptPrompt(result: EngineResult): string {
  const { risks, actions, verdict } = result;
  
  const riskDescriptions = risks.map(r => `${r.title}: ${r.description}`).join('\n');
  const actionDescriptions = actions.map(a => `${a.title} (${a.costRange})`).join('\n');

  return `
你是一位租房谈判顾问。请基于以下房屋问题，生成3套与房东/中介的沟通话术。

## 房屋问题
${riskDescriptions}

## 建议改进方案
${actionDescriptions}

## 话术场景
1. 议价话术：基于房屋缺陷争取租金减免
2. 维修话术：要求房东在入住前修复或改善
3. 改造话术：协商是否允许进行轻度改造（贴膜、打孔等）

## 输出格式（JSON）
{
  "scripts": [
    {
      "scenario": "negotiate",
      "title": "议价话术",
      "content": "..."
    },
    {
      "scenario": "repair", 
      "title": "维修协商",
      "content": "..."
    },
    {
      "scenario": "renovation",
      "title": "改造许可",
      "content": "..."
    }
  ]
}

要求：
- 语气礼貌但坚定
- 基于事实（问题确实存在）
- 给出具体诉求（减租金额/维修项目/改造范围）
- 每套话术控制在200字以内
`;
}