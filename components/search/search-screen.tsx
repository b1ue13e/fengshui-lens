"use client";

import { Filter } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ScenarioCard } from "@/components/scenario/scenario-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchEntry } from "@/components/shared/search-entry";
import { SectionHeading } from "@/components/shared/section-heading";
import { searchScenarioCards } from "@/lib/search/scenario-search";
import type { Category, ScenarioCard as ScenarioCardType } from "@/lib/types/young-study";

export function SearchScreen({
  categories,
  scenarioCards,
  initialQuery,
  initialCategory,
}: {
  categories: Category[];
  scenarioCards: ScenarioCardType[];
  initialQuery: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState(initialCategory ?? "");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () =>
      searchScenarioCards(scenarioCards, deferredQuery, {
        categorySlug: categorySlug || undefined,
      }),
    [categorySlug, deferredQuery, scenarioCards]
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="完整搜索"
        title="你可以按标题、关键词和分类一起找"
        description="不知道该从哪类开始时，直接搜你脑子里冒出来的那个问题。"
      />

      <div className="space-y-3">
        <SearchEntry value={query} onValueChange={setQuery} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          分类筛选
        </span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm ${categorySlug ? "bg-card text-foreground" : "bg-primary text-primary-foreground"}`}
          onClick={() => setCategorySlug("")}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${
              categorySlug === category.slug ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
            }`}
            onClick={() => setCategorySlug(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {results.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((result) => (
            <ScenarioCard key={result.slug} scenario={result} compact />
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂时没搜到对应内容"
          description="可以试试换个更口语的关键词，比如“坐高铁”“工资条”“快递丢了”。"
          actionLabel="回首页看看推荐"
          actionHref="/"
        />
      )}
    </div>
  );
}
