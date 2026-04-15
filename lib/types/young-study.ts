export type TargetStage =
  | "freshman"
  | "independent"
  | "intern"
  | "graduate"
  | "new-city";

export type ScenarioDifficulty = "easy" | "standard" | "watchout";

export type ScenarioSectionType =
  | "intro"
  | "preparation"
  | "steps"
  | "pitfalls"
  | "faq"
  | "scripts"
  | "checklist"
  | "quiz";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  accent: string;
}

export interface ScenarioStep {
  id: string;
  title: string;
  body: string;
  tip?: string;
}

export interface ScenarioFaq {
  id: string;
  question: string;
  answer: string;
}

export interface ScenarioScript {
  id: string;
  scriptType: "opening" | "followup" | "complaint" | "negotiation";
  title: string;
  content: string;
}

export interface ScenarioQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ScenarioChecklistItem {
  id: string;
  content: string;
  checkedDefault?: boolean;
  sortOrder: number;
}

export interface ScenarioChecklist {
  id: string;
  title: string;
  items: ScenarioChecklistItem[];
}

export interface ScenarioSection {
  id: string;
  sectionType: ScenarioSectionType;
  title: string;
  content:
    | string[]
    | ScenarioStep[]
    | ScenarioFaq[]
    | ScenarioScript[]
    | ScenarioChecklist
    | ScenarioQuiz[];
  sortOrder: number;
}

export interface ScenarioCard {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  difficulty: ScenarioDifficulty;
  estimatedMinutes: number;
  emergencyLevel: number;
  isFeatured: boolean;
  starterPriority: number;
  popularityScore: number;
  coverStyle: string;
  targetStages: TargetStage[];
  keywords: string[];
  aliases: string[];
  tags: string[];
}

export interface ScenarioDetail extends ScenarioCard {
  oneLiner: string;
  targetUsers: string[];
  whatYouWillLearn: string[];
  preparationItems: string[];
  steps: ScenarioStep[];
  pitfallItems: string[];
  faqs: ScenarioFaq[];
  scripts: ScenarioScript[];
  checklist: ScenarioChecklist;
  quiz: ScenarioQuiz[];
  sections: ScenarioSection[];
  relatedScenarioSlugs: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  sortOrder: number;
  targetStages: TargetStage[];
  scenarioSlugs: string[];
}

export interface ToolkitResourceItem {
  id: string;
  content: string;
}

export interface ToolkitResource {
  id: string;
  title: string;
  slug: string;
  summary: string;
  categorySlug: string;
  relatedScenarioSlug?: string;
  downloadName: string;
  copyText: string;
  items: ToolkitResourceItem[];
}

export interface SimulatorOption {
  id: string;
  label: string;
  nextNodeId?: string;
  feedback: string;
  tone: "good" | "okay" | "risky";
  appendToScript?: string;
}

export interface SimulatorNode {
  id: string;
  speaker: "system" | "other";
  title: string;
  message: string;
  options: SimulatorOption[];
}

export interface SimulatorGoal {
  id: string;
  label: string;
  openingLine: string;
  successLine: string;
}

export interface SimulatorScenario {
  id: string;
  slug: string;
  title: string;
  summary: string;
  relatedScenarioSlug?: string;
  goals: SimulatorGoal[];
  nodes: SimulatorNode[];
}

export interface HomeFeedSection {
  id: string;
  title: string;
  description: string;
  items: ScenarioCard[];
}

export interface UserProgressSnapshot {
  favorites: string[];
  completed: string[];
  recent: string[];
  savedToolkits: string[];
  onboardingStage?: TargetStage;
  checklistState: Record<string, Record<string, boolean>>;
}
