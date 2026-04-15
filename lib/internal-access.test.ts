import { describe, expect, it } from "vitest";

import { isInternalPagesEnabled, isInternalPath } from "./internal-access";

describe("internal access controls", () => {
  it("recognizes internal paths", () => {
    expect(isInternalPath("/design")).toBe(true);
    expect(isInternalPath("/dev/metrics")).toBe(true);
    expect(isInternalPath("/dev/cases")).toBe(true);
    expect(isInternalPath("/")).toBe(false);
    expect(isInternalPath("/rent/tools")).toBe(false);
  });

  it("keeps internal pages open outside production", () => {
    expect(isInternalPagesEnabled("development", "false")).toBe(true);
    expect(isInternalPagesEnabled("test", "false")).toBe(true);
  });

  it("hides internal pages in production unless explicitly enabled", () => {
    expect(isInternalPagesEnabled("production", "false")).toBe(false);
    expect(isInternalPagesEnabled("production", undefined)).toBe(false);
    expect(isInternalPagesEnabled("production", "true")).toBe(true);
  });
});
