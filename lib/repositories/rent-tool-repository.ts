import { toEvaluationReport } from "@/lib/adapters/evaluation-adapter";
import { prisma } from "@/lib/prisma";
import type { EvaluationReport } from "@/lib/rent-tools/types";

export async function getRentToolEvaluationById(
  id: string
): Promise<EvaluationReport | null> {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    return null;
  }

  return toEvaluationReport(evaluation);
}
