import Link from "next/link";
import { ArrowRight, ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function EvaluateStartPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900">
          <Home className="h-4 w-4" /> 首页
        </Link>
        <ArrowRight className="h-4 w-4" />
        <span>租房判断</span>
      </div>

      <div>
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">完整租房判断</h1>
        <p className="text-neutral-500">
          约需 5-8 分钟完成。系统会从空间质量和现实决策两个层面给出结论。
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <Progress value={0} className="mb-6" />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">1</div>
            <div>
              <p className="font-semibold text-neutral-900">基础房源信息</p>
              <p className="text-sm text-neutral-500">户型、面积、楼层、电梯、朝向、年代</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600">2</div>
            <div>
              <p className="font-semibold text-neutral-900">现场空间风险</p>
              <p className="text-sm text-neutral-500">噪音、潮湿、通风、隐私、合租情况</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600">3</div>
            <div>
              <p className="font-semibold text-neutral-900">现实决策底线</p>
              <p className="text-sm text-neutral-500">预算、通勤、合同、付款方式、合租规则</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-neutral-700 hover:bg-neutral-100">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </Link>
        <Link href="/rent/tools/evaluate/basic">
          <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800">
            开始第一步
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}