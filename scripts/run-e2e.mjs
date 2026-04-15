import { resolve } from "node:path";
import { spawn } from "node:child_process";

const nextBin = resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const playwrightCli = resolve(process.cwd(), "node_modules", "playwright", "cli.js");
const forwardedArgs = process.argv.slice(2);

function runNodeScript(scriptPath, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(
        new Error(`${scriptPath} ${args.join(" ")} exited with code ${code ?? "unknown"}`)
      );
    });

    child.on("error", rejectRun);
  });
}

await runNodeScript(nextBin, ["build"]);
await runNodeScript(playwrightCli, ["test", ...forwardedArgs]);
