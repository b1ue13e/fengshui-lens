import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  categories,
  learningPaths,
  scenarios,
  simulatorScenarios,
  toolkitResources,
} from "../lib/content/seed";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

const tagMap = new Map<string, { id: string; label: string; slug: string }>();

for (const scenario of scenarios) {
  for (const tag of scenario.tags) {
    const slug = slugify(tag);
    if (!tagMap.has(slug)) {
      tagMap.set(slug, {
        id: `tag-${slug}`,
        label: tag,
        slug,
      });
    }
  }
}

const payload = {
  exportedAt: new Date().toISOString(),
  counts: {
    categories: categories.length,
    scenarios: scenarios.length,
    learningPaths: learningPaths.length,
    toolkitResources: toolkitResources.length,
    simulatorScenarios: simulatorScenarios.length,
    tags: tagMap.size,
  },
  tables: {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      accent: category.accent,
      sort_order: category.sortOrder,
    })),
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      slug: scenario.slug,
      category_id: categories.find((item) => item.slug === scenario.categorySlug)?.id ?? null,
      summary: scenario.summary,
      one_liner: scenario.oneLiner,
      target_users: scenario.targetUsers,
      target_stage: scenario.targetStages,
      difficulty: scenario.difficulty,
      estimated_minutes: scenario.estimatedMinutes,
      emergency_level: scenario.emergencyLevel,
      is_featured: scenario.isFeatured,
      starter_priority: scenario.starterPriority,
      popularity_score: scenario.popularityScore,
      cover_style: scenario.coverStyle,
      aliases: scenario.aliases,
      keywords: scenario.keywords,
      tags: scenario.tags,
      related_scenario_slugs: scenario.relatedScenarioSlugs,
    })),
    scenario_sections: scenarios.flatMap((scenario) =>
      scenario.sections.map((section) => ({
        id: section.id,
        scenario_id: scenario.id,
        section_type: section.sectionType,
        title: section.title,
        content: section.content,
        sort_order: section.sortOrder,
      }))
    ),
    scenario_checklists: scenarios.map((scenario) => ({
      id: scenario.checklist.id,
      scenario_id: scenario.id,
      title: scenario.checklist.title,
    })),
    scenario_checklist_items: scenarios.flatMap((scenario) =>
      scenario.checklist.items.map((item) => ({
        id: item.id,
        checklist_id: scenario.checklist.id,
        content: item.content,
        checked_default: item.checkedDefault ?? false,
        sort_order: item.sortOrder,
      }))
    ),
    scenario_faqs: scenarios.flatMap((scenario) =>
      scenario.faqs.map((faq, index) => ({
        id: faq.id,
        scenario_id: scenario.id,
        question: faq.question,
        answer: faq.answer,
        sort_order: index + 1,
      }))
    ),
    scenario_scripts: scenarios.flatMap((scenario) =>
      scenario.scripts.map((script, index) => ({
        id: script.id,
        scenario_id: scenario.id,
        script_type: script.scriptType,
        title: script.title,
        content: script.content,
        sort_order: index + 1,
      }))
    ),
    scenario_quizzes: scenarios.flatMap((scenario) =>
      scenario.quiz.map((quiz, index) => ({
        id: quiz.id,
        scenario_id: scenario.id,
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correctAnswer,
        explanation: quiz.explanation,
        sort_order: index + 1,
      }))
    ),
    learning_paths: learningPaths.map((path) => ({
      id: path.id,
      title: path.title,
      slug: path.slug,
      description: path.description,
      cover: path.cover,
      target_stage: path.targetStages,
      sort_order: path.sortOrder,
    })),
    learning_path_items: learningPaths.flatMap((path) =>
      path.scenarioSlugs.map((scenarioSlug, index) => ({
        id: `${path.id}-item-${index + 1}`,
        learning_path_id: path.id,
        scenario_id: scenarios.find((scenario) => scenario.slug === scenarioSlug)?.id ?? null,
        sort_order: index + 1,
      }))
    ),
    toolkit_resources: toolkitResources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      slug: resource.slug,
      summary: resource.summary,
      category_id: categories.find((item) => item.slug === resource.categorySlug)?.id ?? null,
      related_scenario_slug: resource.relatedScenarioSlug ?? null,
      download_name: resource.downloadName,
      copy_text: resource.copyText,
    })),
    toolkit_resource_items: toolkitResources.flatMap((resource) =>
      resource.items.map((item, index) => ({
        id: item.id,
        toolkit_resource_id: resource.id,
        content: item.content,
        sort_order: index + 1,
      }))
    ),
    simulator_scenarios: simulatorScenarios.map((scenario) => ({
      id: scenario.id,
      slug: scenario.slug,
      title: scenario.title,
      summary: scenario.summary,
      related_scenario_slug: scenario.relatedScenarioSlug ?? null,
    })),
    simulator_goals: simulatorScenarios.flatMap((scenario) =>
      scenario.goals.map((goal, index) => ({
        id: goal.id,
        simulator_scenario_id: scenario.id,
        label: goal.label,
        opening_line: goal.openingLine,
        success_line: goal.successLine,
        sort_order: index + 1,
      }))
    ),
    simulator_nodes: simulatorScenarios.flatMap((scenario) =>
      scenario.nodes.map((node, index) => ({
        id: node.id,
        simulator_scenario_id: scenario.id,
        speaker: node.speaker,
        title: node.title,
        message: node.message,
        sort_order: index + 1,
      }))
    ),
    simulator_options: simulatorScenarios.flatMap((scenario) =>
      scenario.nodes.flatMap((node, index) =>
        node.options.map((option, optionIndex) => ({
          id: option.id,
          simulator_node_id: node.id,
          label: option.label,
          next_node_id: option.nextNodeId ?? null,
          feedback: option.feedback,
          tone: option.tone,
          append_to_script: option.appendToScript ?? null,
          sort_order: index * 10 + optionIndex + 1,
        }))
      )
    ),
    tags: Array.from(tagMap.values()),
    scenario_tags: scenarios.flatMap((scenario) =>
      scenario.tags.map((tag) => ({
        scenario_id: scenario.id,
        tag_id: tagMap.get(slugify(tag))?.id ?? null,
      }))
    ).filter((row) => row.tag_id),
  },
};

async function main() {
  const outputPath = resolve(process.cwd(), "supabase", "seeds", "young-study.seed.json");

  await mkdir(resolve(process.cwd(), "supabase", "seeds"), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Young Study seed exported to ${outputPath}`);
}

void main();
