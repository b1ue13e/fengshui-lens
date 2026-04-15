import { describe, expect, it } from "vitest";

import {
  createEmptyProgressSnapshot,
  mergeProgressSnapshots,
} from "../progress-repository";

describe("青年大学习进度仓库", () => {
  it("createEmptyProgressSnapshot 返回完整初始结构", () => {
    expect(createEmptyProgressSnapshot()).toEqual({
      favorites: [],
      completed: [],
      recent: [],
      savedToolkits: [],
      checklistState: {},
    });
  });

  it("mergeProgressSnapshots 会去重、截断 recent，并优先保留本地清单状态", () => {
    const localSnapshot = {
      favorites: ["how-to-rent-house", "go-to-hospital"],
      completed: ["how-to-rent-house"],
      recent: Array.from({ length: 14 }, (_, index) => `local-${index + 1}`),
      savedToolkits: ["rent-checklist"],
      onboardingStage: "intern" as const,
      checklistState: {
        rent: {
          one: true,
        },
      },
    };

    const remoteSnapshot = {
      favorites: ["go-to-hospital", "call-police"],
      completed: ["call-police"],
      recent: ["remote-1", "remote-2"],
      savedToolkits: ["rent-checklist", "salary-quick-card"],
      onboardingStage: "freshman" as const,
      checklistState: {
        rent: {
          one: false,
          two: true,
        },
      },
    };

    const merged = mergeProgressSnapshots(localSnapshot, remoteSnapshot);

    expect(merged.favorites).toEqual([
      "how-to-rent-house",
      "go-to-hospital",
      "call-police",
    ]);
    expect(merged.completed).toEqual(["how-to-rent-house", "call-police"]);
    expect(merged.savedToolkits).toEqual(["rent-checklist", "salary-quick-card"]);
    expect(merged.onboardingStage).toBe("freshman");
    expect(merged.checklistState.rent).toEqual({
      one: true,
      two: true,
    });
    expect(merged.recent).toHaveLength(12);
    expect(merged.recent[0]).toBe("local-1");
  });
});
