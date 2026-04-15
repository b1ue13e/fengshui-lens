import { NextResponse } from "next/server";

import { getSurvivalKnowledgeBase } from "../../../lib/survival/knowledge-repository";
import { createRoutePlan } from "../../../lib/survival/planner";
import { routePlanRepository } from "../../../lib/survival/route-plan-repository";
import { RouteWizardInputSchema } from "../../../lib/types/survival-sandbox";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = RouteWizardInputSchema.parse(payload);
    const knowledgeBase = await getSurvivalKnowledgeBase();
    const plan = await createRoutePlan({ input, knowledgeBase });
    const saveResult = await routePlanRepository.saveRemoteRoutePlan(plan);

    return NextResponse.json({
      planId: plan.id,
      plan,
      savedRemote: saveResult.ok,
    });
  } catch (error) {
    console.error("[api/survival-plans] Failed to create plan:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "无法生成路线图，请检查输入或稍后再试。",
      },
      { status: 400 }
    );
  }
}
