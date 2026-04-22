"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Home,
  MapPin,
  MessageCircle,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackFunnelEvent } from "@/lib/feedback/funnel";

export function FocusedHome() {
  return (
    <div className="space-y-12">
      <section className="py-12 text-center md:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          <Shield className="size-4" />
          现实决策训练系统
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
          青年大学习
        </h1>
        <p className="mx-auto mb-2 max-w-2xl text-lg text-neutral-500 md:text-xl">
          不是给你看信息，是陪你练判断
        </p>
        <p className="mx-auto mb-10 max-w-xl text-sm text-neutral-400">
          当前第一入口：上海首次租房决策 → 决定来上海后的落地路线
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/rent/tools/evaluate"
            onClick={() =>
              trackFunnelEvent({
                event: "home_primary_cta_clicked",
                source: "kimi_home_primary_evaluate",
              })
            }
          >
            <Button size="lg" className="h-14 gap-2 bg-neutral-900 px-8 text-base hover:bg-neutral-800">
              <ClipboardCheck className="size-5" />
              开始完整租房判断
            </Button>
          </Link>
          <Link
            href="/rent/tools/analyze"
            onClick={() =>
              trackFunnelEvent({
                event: "home_primary_cta_clicked",
                source: "kimi_home_secondary_analyze",
              })
            }
          >
            <Button size="lg" variant="outline" className="h-14 gap-2 border-neutral-300 px-8 text-base">
              <MessageCircle className="size-5" />
              有房源链接？先速读排坑
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <Home className="size-6" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-bold text-neutral-900">第一入口：上海首次租房判断</h2>
              <p className="mb-4 text-neutral-500">
                你不需要成为租房专家，只需要在半小时内完成一次结构化判断。系统从空间质量、现实成本、合同风险三个层面给你结论：
                <span className="font-medium text-green-600">值得谈</span>、
                <span className="font-medium text-amber-600">谨慎推进</span>、或
                <span className="font-medium text-red-600">建议放弃</span>。
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/rent/tools/evaluate">
                  <Button className="bg-neutral-900 hover:bg-neutral-800">开始完整评估</Button>
                </Link>
                <Link href="/rent/tools/compare">
                  <Button variant="outline" className="border-neutral-300">两套房对比</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <MapPin className="size-6" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-bold text-neutral-900">第二承接：决定来上海后的落地路线</h2>
              <p className="mb-4 text-neutral-500">
                租房判断完成后，如果你决定来上海，系统会根据你的毕业时间、offer 状态、到沪时间窗口，生成一份按阶段推进的行动路线图：签约前 → 到沪前 → 第一周 → 入职后。
              </p>
              <Link
                href="/survival-plans/start"
                onClick={() =>
                  trackFunnelEvent({
                    event: "route_plan_open",
                    source: "kimi_home_handoff",
                  })
                }
              >
                <Button variant="outline" className="gap-2 border-neutral-300">
                  生成我的到沪路线
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-neutral-900">训练底盘</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/resources">
            <div className="h-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
              <BookOpen className="mb-3 size-6 text-neutral-700" />
              <h4 className="mb-1 font-semibold text-neutral-900">场景学习</h4>
              <p className="text-sm text-neutral-500">15+ 真实场景，从租房到求职到维权</p>
            </div>
          </Link>
          <Link href="/toolkit">
            <div className="h-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
              <ClipboardCheck className="mb-3 size-6 text-neutral-700" />
              <h4 className="mb-1 font-semibold text-neutral-900">工具箱</h4>
              <p className="text-sm text-neutral-500">合同审查清单、话术模板、预算表</p>
            </div>
          </Link>
          <Link href="/simulator">
            <div className="h-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
              <MessageCircle className="mb-3 size-6 text-neutral-700" />
              <h4 className="mb-1 font-semibold text-neutral-900">模拟器</h4>
              <p className="text-sm text-neutral-500">租金谈判、押金纠纷等对话训练</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
