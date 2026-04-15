import { SurvivalPlanPage } from "@/components/survival/survival-plan-page";

export default async function RoutePlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurvivalPlanPage planId={id} />;
}
