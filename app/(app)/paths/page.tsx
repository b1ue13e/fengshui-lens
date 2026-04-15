import { PathCard } from "@/components/paths/path-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function PathsPage() {
  const paths = await contentRepository.getLearningPaths();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="学习路径"
        title="如果你不想自己挑，就按阶段一路学下去"
        description="把多个高频场景打包成路线，适合“现在就想有个顺序”的人。"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {paths.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
    </div>
  );
}
