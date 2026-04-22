"use client";

import Link from "next/link";
import { Search, Home, ArrowRight, BookOpen, Layers, Wrench, GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchScenarioCards } from "@/lib/search/scenario-search";
import type { Category, ScenarioCard as ScenarioCardType } from "@/lib/types/content";

type SearchResultCategory = { slug: string; name: string; description: string };

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
  const [keyword, setKeyword] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const [categorySlug] = useState(initialCategory ?? "");

  const scenarioResults = useMemo(
    () =>
      hasSearched && keyword.trim()
        ? searchScenarioCards(scenarioCards, keyword, { categorySlug: categorySlug || undefined })
        : [],
    [categorySlug, hasSearched, keyword, scenarioCards]
  );

  const categoryResults = useMemo<SearchResultCategory[]>(() => {
    if (!hasSearched || !keyword.trim()) return [];
    const lower = keyword.trim().toLowerCase();
    return categories.filter((item) => item.name.toLowerCase().includes(lower)).slice(0, 6);
  }, [categories, hasSearched, keyword]);

  const pathResults = useMemo(() => {
    if (!hasSearched || !keyword.trim()) return [] as Array<{ slug: string; title: string }>;
    return keyword.includes("路线") || keyword.includes("路径") || keyword.includes("到沪")
      ? [{ slug: "default", title: "从租房到落地的连续学习" }]
      : [];
  }, [hasSearched, keyword]);

  const toolResults = useMemo(() => {
    if (!hasSearched || !keyword.trim()) return [] as Array<{ slug: string; title: string }>;
    return ["工具", "清单", "模板", "合同", "预算"].some((item) => keyword.includes(item))
      ? [
          { slug: "toolkit", title: "工具箱" },
          { slug: "rent-tools", title: "租房判断主链" },
        ]
      : [];
  }, [hasSearched, keyword]);

  const totalResults =
    scenarioResults.length + categoryResults.length + pathResults.length + toolResults.length;

  const handleSearch = () => {
    if (keyword.trim()) setHasSearched(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900">
          <Home className="h-4 w-4" /> 首页
        </Link>
        <span>/</span>
        <span>搜索</span>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">搜索</h1>
        <div className="flex gap-3">
          <Input
            placeholder="搜索场景、工具、路径..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            className="flex-1 border-neutral-300 bg-white"
          />
          <Button onClick={handleSearch} className="gap-2 bg-neutral-900 hover:bg-neutral-800">
            <Search className="h-4 w-4" />
            搜索
          </Button>
        </div>
      </div>

      {hasSearched ? (
        isLoadingBlock(totalResults, keyword, scenarioResults, categoryResults, pathResults, toolResults)
      ) : null}
    </div>
  );
}

function isLoadingBlock(
  totalResults: number,
  keyword: string,
  scenarioResults: ScenarioCardType[],
  categoryResults: SearchResultCategory[],
  pathResults: Array<{ slug: string; title: string }>,
  toolResults: Array<{ slug: string; title: string }>
) {
  if (totalResults === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-neutral-500">未找到与 “{keyword}” 相关的内容</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/rent/tools/evaluate"><Button variant="outline" className="border-neutral-300">去做租房判断</Button></Link>
          <Link href="/resources"><Button variant="outline" className="border-neutral-300">浏览资源</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {scenarioResults.length > 0 ? (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-bold text-neutral-900">
            <BookOpen className="h-5 w-5" />场景 ({scenarioResults.length})
          </h2>
          <div className="space-y-2">
            {scenarioResults.map((s) => (
              <Link key={s.slug} href={`/scenario/${s.slug}`}>
                <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{s.title}</p>
                      <p className="text-sm text-neutral-500">{s.summary}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {categoryResults.length > 0 ? (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-bold text-neutral-900">
            <Layers className="h-5 w-5" />分类 ({categoryResults.length})
          </h2>
          <div className="space-y-2">
            {categoryResults.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`}>
                <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                  <p className="font-medium text-neutral-900">{c.name}</p>
                  <p className="text-sm text-neutral-500">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {pathResults.length > 0 ? (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-bold text-neutral-900">
            <GraduationCap className="h-5 w-5" />学习路径 ({pathResults.length})
          </h2>
          <div className="space-y-2">
            {pathResults.map((p) => (
              <Link key={p.slug} href="/paths">
                <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                  <p className="font-medium text-neutral-900">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {toolResults.length > 0 ? (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-bold text-neutral-900">
            <Wrench className="h-5 w-5" />工具 ({toolResults.length})
          </h2>
          <div className="space-y-2">
            {toolResults.map((t) => (
              <Link key={t.slug} href={t.slug === "toolkit" ? "/toolkit" : "/rent/tools"}>
                <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                  <p className="font-medium text-neutral-900">{t.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}