import { SimulatorPlayer } from "@/components/simulator/simulator-player";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function SimulatorPage() {
  const scenarios = await contentRepository.getSimulatorScenarios();
  return <SimulatorPlayer scenarios={scenarios} />;
}
