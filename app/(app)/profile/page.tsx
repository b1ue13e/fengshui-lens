import { ProfileScreen } from "@/components/profile/profile-screen";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function ProfilePage() {
  const [scenarioCards, learningPaths, toolkitResources] = await Promise.all([
    contentRepository.getScenarioCards(),
    contentRepository.getLearningPaths(),
    contentRepository.getToolkitResources(),
  ]);

  return (
    <ProfileScreen
      scenarioCards={scenarioCards}
      learningPaths={learningPaths}
      toolkitResources={toolkitResources}
    />
  );
}
