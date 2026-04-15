"use server";

import { getServerSupabaseClient } from "../../lib/supabase/server";
import { routePlanRepository } from "../../lib/survival/route-plan-repository";
import {
  createEmptyProgressSnapshot,
  mergeProgressSnapshots,
  progressRepository,
} from "../../lib/repositories/progress-repository";
import type { RoutePlan } from "../../lib/types/survival-sandbox";
import type { UserProgressSnapshot } from "../../lib/types/young-study";

async function resolveCurrentUserId() {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [value, ...list];
}

export async function toggleFavorite(snapshot: UserProgressSnapshot, slug: string) {
  const nextSnapshot = {
    ...snapshot,
    favorites: toggleValue(snapshot.favorites, slug),
  };

  const userId = await resolveCurrentUserId();

  if (userId) {
    await progressRepository.saveRemoteProgress(userId, nextSnapshot);
  }

  return nextSnapshot;
}

export async function markScenarioComplete(
  snapshot: UserProgressSnapshot,
  slug: string,
  completed = true
) {
  const nextSnapshot = {
    ...snapshot,
    completed: completed
      ? Array.from(new Set([slug, ...snapshot.completed]))
      : snapshot.completed.filter((item) => item !== slug),
  };

  const userId = await resolveCurrentUserId();

  if (userId) {
    await progressRepository.saveRemoteProgress(userId, nextSnapshot);
  }

  return nextSnapshot;
}

export async function updateChecklistState(
  snapshot: UserProgressSnapshot,
  checklistId: string,
  itemId: string,
  checked: boolean
) {
  const nextSnapshot = {
    ...snapshot,
    checklistState: {
      ...snapshot.checklistState,
      [checklistId]: {
        ...(snapshot.checklistState[checklistId] ?? {}),
        [itemId]: checked,
      },
    },
  };

  const userId = await resolveCurrentUserId();

  if (userId) {
    await progressRepository.saveRemoteProgress(userId, nextSnapshot);
  }

  return nextSnapshot;
}

export async function recordRecentView(snapshot: UserProgressSnapshot, slug: string) {
  const nextSnapshot = {
    ...snapshot,
    recent: [slug, ...snapshot.recent.filter((item) => item !== slug)].slice(0, 12),
  };

  const userId = await resolveCurrentUserId();

  if (userId) {
    await progressRepository.saveRemoteProgress(userId, nextSnapshot);
  }

  return nextSnapshot;
}

export async function saveThemePreference(theme: "light" | "dark" | "system") {
  const userId = await resolveCurrentUserId();
  const supabase = await getServerSupabaseClient();

  if (!userId || !supabase) {
    return { ok: true, mode: "local-only" } as const;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, preferred_theme: theme }, { onConflict: "id" });

  if (error) {
    return { ok: false, reason: error.message } as const;
  }

  return { ok: true, mode: "supabase" } as const;
}

export async function submitFeedback(payload: {
  email?: string;
  message: string;
  page?: string;
}) {
  const userId = await resolveCurrentUserId();
  return progressRepository.submitFeedback({
    userId: userId ?? undefined,
    email: payload.email,
    message: payload.message,
    page: payload.page,
  });
}

export async function mergeLocalProgressAfterLogin(localSnapshot: UserProgressSnapshot) {
  const userId = await resolveCurrentUserId();

  if (!userId) {
    return createEmptyProgressSnapshot();
  }

  const remoteSnapshot = await progressRepository.getRemoteProgress(userId);
  const mergedSnapshot = mergeProgressSnapshots(localSnapshot, remoteSnapshot);
  await progressRepository.saveRemoteProgress(userId, mergedSnapshot);

  return mergedSnapshot;
}

export async function syncLocalRoutePlansAfterLogin(localPlans: RoutePlan[]) {
  if (!localPlans.length) {
    return { ok: true, mode: "no-local-plans", count: 0 } as const;
  }

  const result = await routePlanRepository.syncRemoteRoutePlans(localPlans);

  if (!result.ok) {
    return { ok: false, reason: result.reason } as const;
  }

  return { ok: true, mode: "supabase", count: result.count } as const;
}
