import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProgressSnapshot } from "../../types/young-study";

const {
  createEmptyProgressSnapshot,
  getRemoteProgress,
  getServerSupabaseClient,
  mergeProgressSnapshots,
  saveRemoteProgress,
  submitFeedback,
  syncRemoteRoutePlans,
} = vi.hoisted(() => ({
  createEmptyProgressSnapshot: vi.fn(),
  getRemoteProgress: vi.fn(),
  getServerSupabaseClient: vi.fn(),
  mergeProgressSnapshots: vi.fn(),
  saveRemoteProgress: vi.fn(),
  submitFeedback: vi.fn(),
  syncRemoteRoutePlans: vi.fn(),
}));

vi.mock("../../supabase/server", () => ({
  getServerSupabaseClient,
}));

vi.mock("../../repositories/progress-repository", () => ({
  createEmptyProgressSnapshot,
  mergeProgressSnapshots,
  progressRepository: {
    getRemoteProgress,
    saveRemoteProgress,
    submitFeedback,
  },
}));

vi.mock("../route-plan-repository", () => ({
  routePlanRepository: {
    syncRemoteRoutePlans,
  },
}));

import { mergeLocalProgressAfterLogin } from "../../../app/actions/young-study";

const emptySnapshot: UserProgressSnapshot = {
  favorites: [],
  completed: [],
  recent: [],
  savedToolkits: [],
  checklistState: {},
};

describe("mergeLocalProgressAfterLogin", () => {
  beforeEach(() => {
    createEmptyProgressSnapshot.mockReset();
    getRemoteProgress.mockReset();
    getServerSupabaseClient.mockReset();
    mergeProgressSnapshots.mockReset();
    saveRemoteProgress.mockReset();
    submitFeedback.mockReset();
    syncRemoteRoutePlans.mockReset();
    createEmptyProgressSnapshot.mockReturnValue(emptySnapshot);
  });

  it("falls back to an empty local snapshot when there is no authenticated Supabase user", async () => {
    getServerSupabaseClient.mockResolvedValue(null);

    const result = await mergeLocalProgressAfterLogin({
      favorites: ["how-to-rent-house"],
      completed: [],
      recent: [],
      savedToolkits: [],
      checklistState: {},
    });

    expect(createEmptyProgressSnapshot).toHaveBeenCalledOnce();
    expect(getRemoteProgress).not.toHaveBeenCalled();
    expect(saveRemoteProgress).not.toHaveBeenCalled();
    expect(result).toEqual(emptySnapshot);
  });

  it("loads, merges, and saves progress for the authenticated cloud user", async () => {
    const localSnapshot: UserProgressSnapshot = {
      favorites: ["how-to-rent-house"],
      completed: ["how-to-rent-house"],
      recent: ["how-to-rent-house"],
      savedToolkits: [],
      checklistState: {},
    };

    const remoteSnapshot: UserProgressSnapshot = {
      favorites: ["call-police"],
      completed: [],
      recent: ["call-police"],
      savedToolkits: ["salary-quick-card"],
      checklistState: {},
    };

    const mergedSnapshot: UserProgressSnapshot = {
      favorites: ["how-to-rent-house", "call-police"],
      completed: ["how-to-rent-house"],
      recent: ["how-to-rent-house", "call-police"],
      savedToolkits: ["salary-quick-card"],
      checklistState: {},
    };

    getServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: { id: "user-123" },
          },
        }),
      },
    });
    getRemoteProgress.mockResolvedValue(remoteSnapshot);
    mergeProgressSnapshots.mockReturnValue(mergedSnapshot);
    saveRemoteProgress.mockResolvedValue({ ok: true });

    const result = await mergeLocalProgressAfterLogin(localSnapshot);

    expect(getRemoteProgress).toHaveBeenCalledWith("user-123");
    expect(mergeProgressSnapshots).toHaveBeenCalledWith(localSnapshot, remoteSnapshot);
    expect(saveRemoteProgress).toHaveBeenCalledWith("user-123", mergedSnapshot);
    expect(result).toEqual(mergedSnapshot);
  });
});
