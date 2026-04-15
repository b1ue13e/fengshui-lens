import Fuse from "fuse.js";

import type { ScenarioCard } from "../types/young-study";

export type ScenarioSearchFilters = {
  categorySlug?: string;
};

export type ScenarioSearchResult = ScenarioCard & {
  score: number;
  matchLabel: string;
};

const fuseCache = new WeakMap<ScenarioCard[], Fuse<ScenarioCard>>();

function getFuse(cards: ScenarioCard[]) {
  const cached = fuseCache.get(cards);

  if (cached) {
    return cached;
  }

  const fuse = new Fuse(cards, {
    includeScore: true,
    shouldSort: true,
    ignoreLocation: true,
    threshold: 0.38,
    keys: [
      { name: "title", weight: 0.42 },
      { name: "aliases", weight: 0.18 },
      { name: "keywords", weight: 0.16 },
      { name: "summary", weight: 0.14 },
      { name: "tags", weight: 0.06 },
      { name: "categoryName", weight: 0.04 },
    ],
  });

  fuseCache.set(cards, fuse);

  return fuse;
}

export function searchScenarioCards(
  cards: ScenarioCard[],
  query: string,
  filters: ScenarioSearchFilters = {}
): ScenarioSearchResult[] {
  const categorySlug = filters.categorySlug?.trim();
  const normalizedQuery = query.trim();
  const filteredCards = categorySlug
    ? cards.filter((card) => card.categorySlug === categorySlug)
    : cards;

  if (!normalizedQuery) {
    return filteredCards
      .slice()
      .sort(
        (left, right) =>
          right.starterPriority - left.starterPriority ||
          right.popularityScore - left.popularityScore
      )
      .map((card) => ({
        ...card,
        score: 0,
        matchLabel: card.categoryName || "Recommended",
      }));
  }

  const matches = getFuse(cards).search(normalizedQuery);
  const filteredMatches = categorySlug
    ? matches.filter((item) => item.item.categorySlug === categorySlug)
    : matches;

  return filteredMatches.map((item) => ({
    ...item.item,
    score: item.score ?? 0,
    matchLabel: item.item.categoryName || "Related",
  }));
}
