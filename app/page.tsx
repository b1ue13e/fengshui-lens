import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Home,
  Search,
  ClipboardCheck,
  FileText,
  Clock,
  Users,
  Award
} from "lucide-react";

// Feature 卡片
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof Shield; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-xl bg-stone-100 group-hover:bg-stone-900 transition-colors flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-stone-700 group-hover:text-white transition-colors" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// 流程步骤
const steps = [
  { 
    icon: Home, 
    title: "填写基本信息", 
    desc: "户型、面积、朝向、楼层",
    time: "1 分钟"
  },
  { 
    icon: Search, 
    title: "评估空间细节", 
    desc: "西晒、噪音源、通风情况",
    time: "1 分钟"
  },
  { 
    icon: ClipboardCheck, 
    title: "说明居住需求", 
    desc: "预算、改造意愿、目标",
    time: "1 分钟"
  },
  { 
    icon: FileText, 
    title: "获取评估报告", 
    desc: "六维评分、风险、建议",
    time: "即时"
  },
];

// 信任指标
const trustIndicators = [
  { icon: Clock, label: "3 分钟完成", desc: "快速评估" },
  { icon: Users, label: "6 大维度", desc: "全面分析" },
  { icon: Award, label: "科学方法", desc: "数据驱动" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-stone-700" />
            <span className="font-semibold text-stone-900">SpaceRisk</span>
          </Link>
          <nav className="flex gap-6 text-sm text-stone-600">
            <Link href="/" className="hover:text-stone-900">首页</Link>
            <Link href="/evaluate" className="hover:text-stone-900">开始评估</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-6 tracking-tight">
            租房前 3 分钟风险评估
            <br />
            <span className="text-stone-600">避开 90% 的居住坑</span>
          </h1>
          <p className="text-lg text-stone-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            SpaceRisk 基于居住科学，从采光、噪音、潮湿、隐私等 6 个维度
            评估房源风险，生成低成本改造方案和沟通话术。
          </p>
          
          {/* 信任指标 */}
          <div className="flex justify-center gap-8 mb-8">
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-stone-500">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link href="/evaluate">
              <Button size="lg" className="bg-stone-900 hover:bg-stone-800 h-12 px-8 text-base">
                免费开始评估
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                对比房源
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-900 mb-3">为什么选择 SpaceRisk</h2>
            <p className="text-stone-600">基于居住科学的系统性评估，不只凭感觉</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={AlertTriangle}
              title="识别隐藏风险"
              description="西晒、临街噪音、潮湿霉变等 6 大维度风险扫描，避免入住后后悔。"
            />
            <FeatureCard
              icon={Lightbulb}
              title="低成本改造"
              description="针对发现的问题，推荐 ¥0-500 可执行的改善方案，不折腾装修。"
            />
            <FeatureCard
              icon={MessageSquare}
              title="沟通话术"
              description="基于评估结果生成议价、维修协商话术，直接复制使用。"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-900 mb-3">评估流程</h2>
            <p className="text-stone-600">简单 4 步，快速获得专业评估</p>
          </div>
          
          {/* Desktop: Horizontal */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="p-5 rounded-xl bg-white border border-stone-200 h-full">
                  <div className="h-10 w-10 rounded-lg bg-stone-900 text-white flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-stone-400">0{index + 1}</span>
                    <h3 className="font-semibold text-stone-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-stone-600 mb-2">{step.desc}</p>
                  <span className="text-xs text-stone-400">{step.time}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-stone-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile: Vertical */}
          <div className="md:hidden space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-lg bg-stone-900 text-white flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-full bg-stone-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-stone-900">{step.title}</h3>
                      <span className="text-xs text-stone-400">{step.time}</span>
                    </div>
                    <p className="text-sm text-stone-600">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">看房 10 次，不如先评 1 次</h2>
          <p className="text-stone-400 mb-8 text-lg">
            基于居住科学的风险评估，帮你避开 90% 的租房坑。
          </p>
          
          {/* 优势列表 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["免费使用", "无需注册", "即时出报告"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-stone-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
          
          <Link href="/evaluate">
            <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-100 h-12 px-8 text-base">
              立即开始评估
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t bg-white">
        <div className="max-w-5xl mx-auto text-center text-sm text-stone-500">
          <p>© 2026 SpaceRisk. 基于居住科学的租房决策工具。</p>
        </div>
      </footer>
    </div>
  );
}
