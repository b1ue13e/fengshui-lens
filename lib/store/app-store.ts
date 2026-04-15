"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { TargetStage, UserProgressSnapshot } from "@/lib/types/young-study";

type ToastMessage = {
  id: number;
  title: string;
  description?: string;
};

type AppState = UserProgressSnapshot & {
  onboardingCompleted: boolean;
  toast: ToastMessage | null;
  toggleFavorite: (slug: string) => void;
  toggleToolkitSave: (slug: string) => void;
  markScenarioComplete: (slug: string, completed?: boolean) => void;
  recordRecentView: (slug: string) => void;
  setOnboardingStage: (stage: TargetStage) => void;
  completeOnboarding: () => void;
  updateChecklistState: (checklistId: string, itemId: string, checked: boolean) => void;
  hydrateRemoteProgress: (snapshot: UserProgressSnapshot) => void;
  pushToast: (title: string, description?: string) => void;
  clearToast: () => void;
};

function uniqueWithLatest(items: string[], value: string, limit = 12) {
  return [value, ...items.filter((item) => item !== value)].slice(0, limit);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      completed: [],
      recent: [],
      savedToolkits: [],
      checklistState: {},
      onboardingStage: undefined,
      onboardingCompleted: false,
      toast: null,
      toggleFavorite: (slug) =>
        set((state) => ({
          favorites: state.favorites.includes(slug)
            ? state.favorites.filter((item) => item !== slug)
            : [slug, ...state.favorites],
        })),
      toggleToolkitSave: (slug) =>
        set((state) => ({
          savedToolkits: state.savedToolkits.includes(slug)
            ? state.savedToolkits.filter((item) => item !== slug)
            : [slug, ...state.savedToolkits],
        })),
      markScenarioComplete: (slug, completed = true) =>
        set((state) => ({
          completed: completed
            ? uniqueWithLatest(state.completed, slug, 99)
            : state.completed.filter((item) => item !== slug),
        })),
      recordRecentView: (slug) =>
        set((state) => ({
          recent: uniqueWithLatest(state.recent, slug),
        })),
      setOnboardingStage: (stage) =>
        set({
          onboardingStage: stage,
          onboardingCompleted: true,
        }),
      completeOnboarding: () =>
        set({
          onboardingCompleted: true,
        }),
      updateChecklistState: (checklistId, itemId, checked) =>
        set((state) => ({
          checklistState: {
            ...state.checklistState,
            [checklistId]: {
              ...(state.checklistState[checklistId] ?? {}),
              [itemId]: checked,
            },
          },
        })),
      hydrateRemoteProgress: (snapshot) =>
        set((state) => ({
          favorites: Array.from(new Set([...snapshot.favorites, ...state.favorites])),
          completed: Array.from(new Set([...snapshot.completed, ...state.completed])),
          recent: Array.from(new Set([...state.recent, ...snapshot.recent])).slice(0, 12),
          savedToolkits: Array.from(
            new Set([...snapshot.savedToolkits, ...state.savedToolkits])
          ),
          checklistState: {
            ...snapshot.checklistState,
            ...state.checklistState,
          },
          onboardingStage: state.onboardingStage ?? snapshot.onboardingStage,
          onboardingCompleted: state.onboardingCompleted || Boolean(snapshot.onboardingStage),
        })),
      pushToast: (title, description) =>
        set({
          toast: {
            id: Date.now(),
            title,
            description,
          },
        }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: "young-study-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        completed: state.completed,
        recent: state.recent,
        savedToolkits: state.savedToolkits,
        checklistState: state.checklistState,
        onboardingStage: state.onboardingStage,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
