/**
 * 沟通话术生成器
 * 
 * 三种语气版本：
 * 1. 温和协商 - 委婉表达，寻求双赢
 * 2. 现实压价 - 基于问题争取合理降价
 * 3. 直接指出 - 明确说明问题，要求解决
 * 
 * 所有话术基于真实问题生成，不编造
 */

import { Dimension, EngineResult } from "@/lib/rent-tools/types";

export interface ChatScript {
  scenario: 'negotiate' | 'repair' | 'renovation';
  tone: 'gentle' | 'firm' | 'direct';
  title: string;
  content: string;
}

interface ScriptTemplate {
  tone: 'gentle' | 'firm' | 'direct';
  title: string;
  description: string;
}

const toneTemplates: Record<string, ScriptTemplate> = {
  gentle: {
    tone: 'gentle',
    title: '温和协商',
    description: '委婉表达，给双方留余地'
  },
  firm: {
    tone: 'firm', 
    title: '现实压价',
    description: '基于问题争取合理价格'
  },
  direct: {
    tone: 'direct',
    title: '直接指出',
    description: '明确说明问题，要求解决'
  }
};

/**
 * 生成议价话术
 */
function generateNegotiateScript(report: EngineResult, tone: 'gentle' | 'firm' | 'direct'): string {
  const topRisks = report.risks.slice(0, 2);
  const lowestDim = [...report.dimensions].sort((a, b) => a.score - b.score)[0];
  
  const riskDesc = topRisks.map(r => r.title).join('、') || '部分条件';
  const dimDesc = lowestDim ? `${getDimensionLabel(lowestDim.dimension)}方面` : '整体';
  
  if (tone === 'gentle') {
    return `您好，我对这套房子整体印象还可以，但实地看过后发现${riskDesc}可能需要一些投入改善。考虑到后续还需要${dimDesc}的整改成本，想请问房东在租金上是否还有协商空间？如果价格合适，我可以尽快定下来。`;
  }
  
  if (tone === 'firm') {
    const priceCut = report.overallScore < 60 ? '15-20%' : '10%';
    return `这套房子存在${riskDesc}等问题，${dimDesc}需要额外投入改善。按当前市场价格，这类房源通常有${priceCut}的议价空间。考虑到入住后的整改成本，我的心理价位是XX元/月（比挂牌低${priceCut}）。如果您能接受这个价格，我可以本周内签约。`;
  }
  
  // direct
  return `这套房有以下问题需要解决：${topRisks.map(r => r.description).join('；')}。这些问题直接影响居住体验，整改需要投入时间和费用。要么房东先解决这些问题，要么在租金上做出相应让步。我的底线是XX元/月，否则我只能考虑其他房源。`;
}

/**
 * 生成维修话术
 */
function generateRepairScript(report: EngineResult, tone: 'gentle' | 'firm' | 'direct'): string {
  const repairIssues = report.risks.filter(r => 
    ['damp_signs', 'poor_ventilation', 'old_building_noise'].includes(r.id)
  ).slice(0, 2);
  
  if (repairIssues.length === 0) {
    return tone === 'gentle' 
      ? '目前房屋整体状况还可以，暂时没有需要维修的地方。入住后如果发现问题再沟通。'
      : '房屋现有问题我可以自己处理，不需要房东维修。但希望签署协议明确责任边界。';
  }
  
  const issueList = repairIssues.map(r => `${r.title}（${r.description}）`).join('、');
  
  if (tone === 'gentle') {
    return `看房时发现${issueList}，可能会影响日常居住。想请问这些维修是房东负责，还是需要我们入住后自己处理？如果房东能先修好，我们可以尽快签约。`;
  }
  
  if (tone === 'firm') {
    return `房屋存在${issueList}等问题，这些问题应该在交房前解决。建议：要么房东在签约前完成维修，要么从押金或首月租金中扣除相应的维修费用（预估XX元）由我自己处理。请今天内确认维修方案。`;
  }
  
  // direct
  return `以下维修必须交房前完成：${repairIssues.map(r => r.title).join('、')}。这是房屋的基本居住条件。如果房东无法解决，我需要在租金中扣除维修成本，或者考虑其他房源。请明确维修责任和时间。`;
}

/**
 * 生成改造话术
 */
function generateRenovationScript(report: EngineResult, tone: 'gentle' | 'firm' | 'direct'): string {
  const actionItems = report.actions.slice(0, 2);
  
  if (actionItems.length === 0) {
    return '房屋现状基本满足需求，暂时不需要大的改造。';
  }
  
  const actionList = actionItems.map(a => `${a.title}（${a.costRange}）`).join('、');
  const totalCost = actionItems.reduce((sum, a) => {
    const match = a.costRange.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  
  if (tone === 'gentle') {
    return `为了提升居住体验，我计划入住后做${actionList}等轻改造。这些改造不会破坏房屋结构，退租时可以恢复原状。想提前和您确认是否允许，以及退租时对改造部分的要求。`;
  }
  
  if (tone === 'firm') {
    return `入住后我需要${actionList}等改造，预估投入${totalCost}元左右。这些改造能显著提升房屋价值，且退租时可保留不拆除。希望能在合同中明确：1）允许轻改造；2）退租时不需要强制恢复原状；3）相应投入可抵扣部分押金。`;
  }
  
  // direct
  return `以下改造是入住必要条件：${actionItems.map(a => a.title).join('、')}。这些属于低成本高回报的改善，且不会破坏房屋结构。我会在合同中注明改造范围，退租时不负责恢复原状。如不能接受，请提前说明。`;
}

function getDimensionLabel(dim: Dimension): string {
  const labels: Record<Dimension, string> = {
    lighting: '采光',
    noise: '噪音',
    dampness: '潮湿',
    privacy: '隐私',
    circulation: '动线',
    focus: '专注'
  };
  return labels[dim] || dim;
}

/**
 * 生成全部话术
 */
export function generateChatScripts(report: EngineResult): ChatScript[] {
  const tones: ('gentle' | 'firm' | 'direct')[] = ['gentle', 'firm', 'direct'];
  const scenarios: ('negotiate' | 'repair' | 'renovation')[] = ['negotiate', 'repair', 'renovation'];
  
  const scripts: ChatScript[] = [];
  
  for (const scenario of scenarios) {
    for (const tone of tones) {
      let content = '';
      
      switch (scenario) {
        case 'negotiate':
          content = generateNegotiateScript(report, tone);
          break;
        case 'repair':
          content = generateRepairScript(report, tone);
          break;
        case 'renovation':
          content = generateRenovationScript(report, tone);
          break;
      }
      
      scripts.push({
        scenario,
        tone,
        title: toneTemplates[tone].title,
        content
      });
    }
  }
  
  return scripts;
}

/**
 * 按场景分组获取话术
 */
export function getScriptsByScenario(
  report: EngineResult, 
  scenario: 'negotiate' | 'repair' | 'renovation'
): ChatScript[] {
  return generateChatScripts(report).filter(s => s.scenario === scenario);
}
