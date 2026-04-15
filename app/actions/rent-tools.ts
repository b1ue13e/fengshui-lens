"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { evaluate } from "@/lib/engine";
import { generateWithDeepSeek } from "@/lib/llm/client";
import {
  generateChatScriptPrompt,
  generateReportSummaryPrompt,
} from "@/lib/llm/prompts";
import { prisma } from "@/lib/prisma";
import { getRentToolEvaluationById } from "@/lib/repositories/rent-tool-repository";
import type {
  EvaluationInput,
  EngineResult,
  EvaluationReport,
} from "@/lib/rent-tools/types";

interface ReportSummaryData {
  overallComment: string;
  strength: string;
  concern: string;
  recommendation: string;
}

interface ChatScriptData {
  scripts: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

interface GenerationResult<T> {
  data: T;
}

const hasLLMConfig = Boolean(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY);

function generateFallbackSummary(engineResult: EngineResult): ReportSummaryData {
  const verdictLabels: Record<EngineResult["verdict"], string> = {
    rent: "值得继续了解",
    cautious: "带着问题再核验",
    avoid: "不建议继续推进",
  };

  return {
    overallComment: `评估结果为${verdictLabels[engineResult.verdict]}，综合评分 ${engineResult.overallScore}/100。`,
    strength:
      engineResult.risks.length === 0
        ? "暂未发现明显高风险问题。"
        : `当前最需要关注的是：${engineResult.risks
            .slice(0, 3)
            .map((risk) => risk.title)
            .join("、")}。`,
    concern: engineResult.decisionNote
      ? `决策提示：${engineResult.decisionNote.title}`
      : "",
    recommendation: `优先建议：${engineResult.actions
      .slice(0, 2)
      .map((action) => action.title)
      .join("、")}。`,
  };
}

function generateFallbackChatScripts(engineResult: EngineResult): ChatScriptData {
  return {
    scripts: engineResult.actions.slice(0, 3).map((action, index) => ({
      id: `script-${index}`,
      title: action.title,
      content: action.description,
    })),
  };
}

async function generateRentToolArtifacts(
  engineResult: EngineResult
): Promise<[GenerationResult<ReportSummaryData>, GenerationResult<ChatScriptData>]> {
  if (!hasLLMConfig) {
    return [
      { data: generateFallbackSummary(engineResult) },
      { data: generateFallbackChatScripts(engineResult) },
    ];
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("LLM 请求超时")), 30_000);
    });

    const llmPromise = Promise.all([
      generateWithDeepSeek(
        generateReportSummaryPrompt(engineResult),
        { name: "report_summary", description: "生成租房评估报告总结" },
        (text) => {
          const parts = text.split("\n\n");
          return {
            overallComment: parts[0] || "",
            strength: parts[1] || "",
            concern: parts[2] || "",
            recommendation: parts[3] || "",
          };
        }
      ),
      generateWithDeepSeek(
        generateChatScriptPrompt(engineResult),
        { name: "chat_scripts", description: "生成租房沟通话术" },
        (text) => JSON.parse(text) as ChatScriptData
      ),
    ]);

    return await Promise.race([llmPromise, timeoutPromise]);
  } catch (error) {
    console.error(
      "[submitRentToolEvaluation] LLM generation failed, fallback will be used.",
      error
    );
    return [
      { data: generateFallbackSummary(engineResult) },
      { data: generateFallbackChatScripts(engineResult) },
    ];
  }
}

export async function submitRentToolEvaluation(data: EvaluationInput) {
  try {
    const engineResult = evaluate(data);
    const [summaryResult, chatResult] =
      await generateRentToolArtifacts(engineResult);

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
        chatScripts: JSON.stringify(chatResult.data.scripts),
        summaryText: [
          summaryResult.data.overallComment,
          summaryResult.data.strength,
          summaryResult.data.concern,
          summaryResult.data.recommendation,
        ]
          .filter(Boolean)
          .join("\n\n"),
        verdict: engineResult.verdict,
      },
    });

    revalidatePath(`/rent/tools/report/${evaluation.id}`);
    redirect(`/rent/tools/report/${evaluation.id}`);
  } catch (error: unknown) {
    console.error("[submitRentToolEvaluation] Fatal error:", error);
    const message = error instanceof Error ? error.message : "未知错误";
    throw new Error(`租房评估提交失败: ${message}`);
  }
}

export async function getRentToolEvaluation(
  id: string
): Promise<EvaluationReport | null> {
  return getRentToolEvaluationById(id);
}
