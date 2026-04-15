import { getServerSupabaseClient } from "../supabase/server";
import { hasSupabaseEnv } from "../supabase/env";
import type { UserProgressSnapshot } from "../types/young-study";

export function createEmptyProgressSnapshot(): UserProgressSnapshot {
  return {
    favorites: [],
    completed: [],
    recent: [],
    savedToolkits: [],
    checklistState: {},
  };
}

export function mergeProgressSnapshots(
  localSnapshot: UserProgressSnapshot,
  remoteSnapshot: UserProgressSnapshot
): UserProgressSnapshot {
  const mergeUnique = (left: string[], right: string[]) =>
    Array.from(new Set([...left, ...right]));

  const checklistKeys = new Set([
    ...Object.keys(remoteSnapshot.checklistState),
    ...Object.keys(localSnapshot.checklistState),
  ]);

  const mergedChecklistState = Object.fromEntries(
    Array.from(checklistKeys).map((key) => [
      key,
      {
        ...(remoteSnapshot.checklistState[key] ?? {}),
        ...(localSnapshot.checklistState[key] ?? {}),
      },
    ])
  );

  return {
    favorites: mergeUnique(localSnapshot.favorites, remoteSnapshot.favorites),
    completed: mergeUnique(localSnapshot.completed, remoteSnapshot.completed),
    recent: mergeUnique(localSnapshot.recent, remoteSnapshot.recent).slice(0, 12),
    savedToolkits: mergeUnique(localSnapshot.savedToolkits, remoteSnapshot.savedToolkits),
    onboardingStage: remoteSnapshot.onboardingStage ?? localSnapshot.onboardingStage,
    checklistState: mergedChecklistState,
  };
}

export const progressRepository = {
  async getRemoteProgress(userId?: string): Promise<UserProgressSnapshot> {
    if (!hasSupabaseEnv() || !userId) {
      return createEmptyProgressSnapshot();
    }

    const supabase = await getServerSupabaseClient();

    if (!supabase) {
      return createEmptyProgressSnapshot();
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("favorites, completed, recent, saved_toolkits, onboarding_stage, checklist_state")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return createEmptyProgressSnapshot();
    }

    return {
      favorites: data.favorites ?? [],
      completed: data.completed ?? [],
      recent: data.recent ?? [],
      savedToolkits: data.saved_toolkits ?? [],
      onboardingStage: data.onboarding_stage ?? undefined,
      checklistState: data.checklist_state ?? {},
    };
  },

  async saveRemoteProgress(userId: string, snapshot: UserProgressSnapshot) {
    if (!hasSupabaseEnv()) {
      return { ok: false, reason: "missing-env" } as const;
    }

    const supabase = await getServerSupabaseClient();

    if (!supabase) {
      return { ok: false, reason: "missing-client" } as const;
    }

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        favorites: snapshot.favorites,
        completed: snapshot.completed,
        recent: snapshot.recent,
        saved_toolkits: snapshot.savedToolkits,
        onboarding_stage: snapshot.onboardingStage ?? null,
        checklist_state: snapshot.checklistState,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { ok: false, reason: error.message } as const;
    }

    return { ok: true } as const;
  },

  async submitFeedback(payload: {
    userId?: string;
    email?: string;
    message: string;
    page?: string;
  }) {
    if (!hasSupabaseEnv()) {
      return { ok: true, mode: "local-only" } as const;
    }

    const supabase = await getServerSupabaseClient();

    if (!supabase) {
      return { ok: true, mode: "local-only" } as const;
    }

    const { error } = await supabase.from("feedback_submissions").insert({
      user_id: payload.userId ?? null,
      email: payload.email ?? null,
      message: payload.message,
      page: payload.page ?? null,
    });

    if (error) {
      return { ok: false, reason: error.message } as const;
    }

    return { ok: true, mode: "supabase" } as const;
  },
};
