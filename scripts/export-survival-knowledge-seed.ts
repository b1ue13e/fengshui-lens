import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildSurvivalKnowledgeSeedPayload } from "../lib/survival/knowledge-export";

async function main() {
  const payload = await buildSurvivalKnowledgeSeedPayload({
    includeEmbeddings: process.env.EXPORT_SURVIVAL_EMBEDDINGS === "true",
  });

  const outputPath = resolve(process.cwd(), "supabase", "seeds", "survival-sandbox.seed.json");

  await mkdir(resolve(process.cwd(), "supabase", "seeds"), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Survival sandbox seed exported to ${outputPath}`);
}

void main();
