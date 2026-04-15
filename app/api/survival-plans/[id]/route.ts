import { NextResponse } from "next/server";

import { routePlanRepository } from "../../../../lib/survival/route-plan-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await routePlanRepository.getRemoteRoutePlanById(id);

  if (!plan) {
    return NextResponse.json({ error: "route plan not found" }, { status: 404 });
  }

  return NextResponse.json({ planId: id, plan });
}
