import type { Metadata } from "next";

import { KimiReportScreen } from "@/components/rent-tools/kimi-report-screen";
import { buildDecisionSnapshot } from "@/lib/rent-tools/decision-snapshot";
import { buildRentalEntryMetadata } from "@/lib/metadata/page-metadata";
import type { EvaluationInput, EvaluationReport } from "@/lib/rent-tools/types";
import { evaluate } from "@/lib/engine";

export const metadata: Metadata = buildRentalEntryMetadata(
  "租房判断成果示例",
  "这是青年大学习第一课的判断成果示例页。当前先从上海首次租房切入，先看现实风险，再决定下一步。",
  "/rent/tools/report"
);

const sampleInput: EvaluationInput = {
  layoutType: "one_bedroom",
  areaSqm: 48,
  orientation: "south",
  floorLevel: "middle",
  totalFloors: 18,
  hasElevator: true,
  buildingAge: "medium",
  hasWestFacingWindow: false,
  windowExposure: "partial",
  facesMainRoad: false,
  nearElevator: false,
  unitPosition: "middle",
  hasBalcony: true,
  kitchenType: "closed",
  bathroomPosition: "far_from_bedroom",
  bedPosition: "away_from_door",
  deskPosition: "facing_window",
  ventilation: "good",
  dampSigns: [],
  isShared: false,
  roommateSituation: undefined,
  primaryGoal: "sleep_quality",
  monthlyBudget: "medium",
  commuteTolerance: "under_45",
  commuteMinutes: 32,
  monthlyRent: 4300,
  estimatedMonthlyBills: 350,
  depositMonths: 1,
  paymentCycle: "monthly",
  agentFeeMonths: 0,
  landlordType: "direct_landlord",
  contractVisibility: "reviewed_clear",
  listingMatchLevel: "matches_listing",
  sharedSpaceRules: "clear",
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
};

const engineResult = evaluate(sampleInput);

const sampleReport: EvaluationReport = {
  id: "sample-report",
  createdAt: new Date("2026-04-14T10:00:00+08:00"),
  input: sampleInput,
  ...engineResult,
  summaryText:
    "这套房当前没有特别硬的一票否决项，值得继续推进到现场核验和最终取舍。\n\n真正要做的是带着合同、付款方式和现场核验清单去看房，而不是看完报告就直接拍板。",
  chatScripts: [],
  decisionSnapshot: buildDecisionSnapshot(engineResult),
};

export default function ReportSamplePage() {
  return <KimiReportScreen report={sampleReport} />;
}