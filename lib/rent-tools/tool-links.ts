export type RentToolLink = {
  slug: string;
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

export const rentToolLinks: RentToolLink[] = [
  {
    slug: "analyze",
    title: "房源链接速读",
    description: "粘贴房源链接，先读懂面积、朝向、标签和明显风险，再决定值不值得继续看。",
    href: "/rent/tools/analyze",
    eyebrow: "自动提取",
  },
  {
    slug: "evaluate",
    title: "手动房源评估",
    description: "按三步记录房源底子、现场风险和自己的底线，生成一张能带去看房的判断卡。",
    href: "/rent/tools/evaluate",
    eyebrow: "手动判断",
  },
  {
    slug: "compare",
    title: "房源对比助手",
    description: "把两套房放在同一张对比卡里，看分数、风险和改造成本谁更值得继续推进。",
    href: "/rent/tools/compare",
    eyebrow: "方案比较",
  },
  {
    slug: "report",
    title: "租房判断卡示例",
    description: "预览完整报告长什么样，理解系统会怎样把风险、建议和后续动作讲清楚。",
    href: "/rent/tools/report",
    eyebrow: "报告预览",
  },
];
