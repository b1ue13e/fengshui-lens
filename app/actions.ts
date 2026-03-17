'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { evaluate } from '@/lib/engine';
import { generateWithDeepSeek } from '@/lib/llm/client';
import { generateReportSummaryPrompt, generateChatScriptPrompt } from '@/lib/llm/prompts';
import { EvaluationInput, EngineResult, EvaluationReport } from '@/types';
import { toEvaluationReport } from '@/lib/adapters/evaluation-adapter';

// 检查是否有 LLM API Key
const hasLLMConfig = !!process.env.DEEPSEEK_API_KEY || !!process.env.OPENAI_API_KEY;

console.log('[Server] hasLLMConfig:', hasLLMConfig);
console.log('[Server] DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);

// 降级：不使用 LLM，直接生成简单的报告文案
function generateFallbackSummary(engineResult: EngineResult) {
  const verdictLabels: Record<string, string> = {
    rent: '值得租',
    cautious: '谨慎考虑',
    avoid: '不建议租',
  };
  
  return {
    overallComment: `评估结果：${verdictLabels[engineResult.verdict] || engineResult.verdict}。综合评分 ${engineResult.overallScore}/100。`,
    strength: engineResult.risks.length === 0 
      ? '未发现明显风险点。' 
      : `主要风险：${engineResult.risks.slice(0, 3).map(r => r.title).join('、')}`,
    concern: engineResult.decisionNote 
      ? `注意事项：${engineResult.decisionNote.title}` 
      : '',
    recommendation: `建议：${engineResult.actions.slice(0, 2).map(a => a.title).join('；')}`,
  };
}

function generateFallbackChatScripts(engineResult: EngineResult) {
  return {
    scripts: engineResult.actions.slice(0, 3).map((action, idx) => ({
      id: `script-${idx}`,
      title: action.title,
      content: action.description,
    })),
  };
}

export async function submitEvaluation(data: EvaluationInput) {
  console.log('[submitEvaluation] Started with data:', JSON.stringify(data, null, 2));
  
  try {
    // 1. 运行规则引擎
    console.log('[submitEvaluation] Running evaluate...');
    const engineResult = evaluate(data);
    console.log('[submitEvaluation] Engine result:', engineResult.verdict, engineResult.overallScore);
    
    // 2. 生成文案（并行）- 如果没有 LLM 配置则使用降级方案
    let summaryResult: any;
    let chatResult: any;
    
    if (hasLLMConfig) {
      console.log('[submitEvaluation] Using LLM...');
      try {
        // 添加超时处理
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('LLM 请求超时')), 30000)
        );
        
        const llmPromise = Promise.all([
          generateWithDeepSeek(
            generateReportSummaryPrompt(engineResult),
            { name: 'report_summary', description: '生成评估报告总结' },
            (text) => {
              const parts = text.split('\n\n');
              return {
                overallComment: parts[0] || '',
                strength: parts[1] || '',
                concern: parts[2] || '',
                recommendation: parts[3] || '',
              };
            }
          ),
          generateWithDeepSeek(
            generateChatScriptPrompt(engineResult),
            { name: 'chat_scripts', description: '生成沟通话术' },
            (text) => JSON.parse(text)
          ),
        ]);
        
        [summaryResult, chatResult] = await Promise.race([llmPromise, timeoutPromise]) as any;
        console.log('[submitEvaluation] LLM results received');
      } catch (llmError) {
        console.error('[submitEvaluation] LLM failed, using fallback:', llmError);
        summaryResult = { data: generateFallbackSummary(engineResult) };
        chatResult = { data: generateFallbackChatScripts(engineResult) };
      }
    } else {
      console.log('[submitEvaluation] Using fallback (no LLM config)');
      summaryResult = { data: generateFallbackSummary(engineResult) };
      chatResult = { data: generateFallbackChatScripts(engineResult) };
    }

    // 3. 保存到数据库
    console.log('[submitEvaluation] Saving to database...');
    const evaluation = await prisma.evaluation.create({
      data: {
        ...data,
        dampSigns: data.dampSigns ? JSON.stringify(data.dampSigns) : null,
        
        scoreLighting: engineResult.scores.lighting,
        scoreNoise: engineResult.scores.noise,
        scoreDampness: engineResult.scores.dampness,
        scorePrivacy: engineResult.scores.privacy,
        scoreCirculation: engineResult.scores.circulation,
        scoreFocus: engineResult.scores.focus,
        scoreOverall: engineResult.overallScore,
        
        detectedRisks: JSON.stringify(engineResult.risks),
        recommendedActions: JSON.stringify(engineResult.actions),
        chatScripts: JSON.stringify(chatResult.data.scripts || []),
        summaryText: summaryResult.data.overallComment + '\n\n' + 
                     summaryResult.data.strength + '\n\n' + 
                     summaryResult.data.concern + '\n\n' + 
                     summaryResult.data.recommendation,
        
        verdict: engineResult.verdict,
      },
    });

    console.log('[submitEvaluation] Saved! ID:', evaluation.id);
    
    revalidatePath(`/report/${evaluation.id}`);
    console.log('[submitEvaluation] Redirecting to:', `/report/${evaluation.id}`);
    redirect(`/report/${evaluation.id}`);
    
  } catch (error: any) {
    console.error('[submitEvaluation] Fatal error:', error);
    throw new Error(`评估提交失败: ${error.message || '未知错误'}`);
  }
}

export async function getEvaluation(id: string): Promise<EvaluationReport | null> {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });
  
  if (!evaluation) return null;
  
  // 使用 adapter 进行纯格式转换
  return toEvaluationReport(evaluation);
}
