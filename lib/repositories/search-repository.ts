import { contentRepository } from "@/lib/repositories/content-repository";
import {
  searchScenarioCards,
  type ScenarioSearchFilters,
} from "@/lib/search/scenario-search";

export const searchRepository = {
  async searchScenarios(query: string, filters: ScenarioSearchFilters = {}) {
    const cards = await contentRepository.getScenarioCards();
    return searchScenarioCards(cards, query, filters);
  },
};
