import { describe, expect, it } from "vitest";

import {
  learningPaths,
  scenarios,
  simulatorScenarios,
  toolkitResources,
} from "../seed";

describe("青年大学习种子数据完整性", () => {
  it("满足 MVP 的基础数量要求", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(30);
    expect(learningPaths.length).toBeGreaterThanOrEqual(5);
    expect(toolkitResources.length).toBeGreaterThanOrEqual(10);
    expect(simulatorScenarios.length).toBeGreaterThanOrEqual(6);
  });

  it("每条学习路径引用的场景都存在", () => {
    const scenarioSlugSet = new Set(scenarios.map((scenario) => scenario.slug));

    learningPaths.forEach((path) => {
      path.scenarioSlugs.forEach((slug) => {
        expect(scenarioSlugSet.has(slug)).toBe(true);
      });
    });
  });

  it("每个模拟器选项引用的下一节点都存在", () => {
    simulatorScenarios.forEach((scenario) => {
      const nodeIdSet = new Set(scenario.nodes.map((node) => node.id));

      scenario.nodes.forEach((node) => {
        node.options.forEach((option) => {
          if (option.nextNodeId) {
            expect(nodeIdSet.has(option.nextNodeId)).toBe(true);
          }
        });
      });
    });
  });
});
