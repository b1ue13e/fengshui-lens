import { ToolkitCard } from "@/components/toolkit/toolkit-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function ToolkitPage() {
  const resources = await contentRepository.getToolkitResources();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="工具箱"
        title="不是文章，是能直接复制、下载、发出去的东西"
        description="遇到需要沟通、维权、核对的时候，直接把模板拿去用。"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {resources.map((resource) => (
          <ToolkitCard key={resource.slug} resource={resource} />
        ))}
      </div>
    </div>
  );
}
