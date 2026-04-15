import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const target = process.argv[2];
const tempDir = resolve(process.cwd(), ".tmp-seed-build");
const tscBin = resolve(process.cwd(), "node_modules", "typescript", "bin", "tsc");

const scriptByTarget = {
  "young-study": resolve(tempDir, "scripts", "export-young-study-seed.js"),
  survival: resolve(tempDir, "scripts", "export-survival-knowledge-seed.js"),
};

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });

    child.on("error", rejectRun);
  });
}

async function main() {
  const compiledScript = scriptByTarget[target];

  if (!compiledScript) {
    throw new Error(`Unknown seed export target: ${target}`);
  }

  await rm(tempDir, { recursive: true, force: true });

  try {
    await run(process.execPath, [tscBin, "-p", "tsconfig.scripts.json"]);
    await run(process.execPath, [compiledScript]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await main();
