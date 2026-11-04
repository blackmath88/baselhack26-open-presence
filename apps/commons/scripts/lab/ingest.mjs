// Reuse the standalone workbench's verified, allowlisted ingest without changing its inputs.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
const workbench = fileURLToPath(
  new URL("../../../../sideprojects/pdf-lab/workbench/", import.meta.url),
);
const destination = fileURLToPath(
  new URL("../../public/lab/", import.meta.url),
);
execFileSync(process.execPath, [workbench + "scripts/ingest.mjs"], {
  stdio: "inherit",
});
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(workbench + "public/lab/", destination, { recursive: true });
