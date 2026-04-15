import { SearchScreen } from "@/components/search/search-screen";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const resolved = await searchParams;
  const [categories, scenarioCards] = await Promise.all([
    contentRepository.getCategories(),
    contentRepository.getScenarioCards(),
  ]);

  return (
    <SearchScreen
      categories={categories}
      scenarioCards={scenarioCards}
      initialQuery={resolved.q ?? ""}
      initialCategory={resolved.category}
    />
  );
}
