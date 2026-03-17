'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { evaluate } from '@/lib/engine';
import { generateWithDeepSeek } from '@/lib/llm/client';
import { generateReportSummaryPrompt, generateChatScriptPrompt } from '@/lib/llm/prompts';
import { EvaluationInput, EngineResult, EvaluationReport } from '@/types';
import { toEvaluationReport } from '@/lib/adapters/evaluation-adapter';

export async function submitEvaluation(data: EvaluationInput) {
  try {
    // 1. 运行规则引擎
    const engineResult = evaluate(data);
    
    // 2. 生成LLM文案（并行）
    const [summaryResult, chatResult] = await Promise.all([
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

    // 3. 保存到数据库
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

    revalidatePath(`/report/${evaluation.id}`);
    redirect(`/report/${evaluation.id}`);
    
  } catch (error) {
    console.error('Submit evaluation error:', error);
    throw error;
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
