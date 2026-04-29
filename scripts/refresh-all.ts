/**
 * Orchestrates the full data pipeline.
 * Run: npm run refresh
 */

import { execSync } from "child_process";

function run(script: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${script}`);
  console.log("=".repeat(60));
  execSync(`npx tsx scripts/${script}`, { stdio: "inherit" });
}

async function main() {
  const start = Date.now();
  console.log("Starting full data refresh...\n");

  try {
    run("fetch-air-quality.ts");
  } catch (err) {
    console.error(`fetch-air-quality failed: ${(err as Error).message}`);
  }

  try {
    run("fetch-walkability.ts");
  } catch (err) {
    console.error(`fetch-walkability failed: ${(err as Error).message}`);
  }

  try {
    run("fetch-places.ts");
  } catch (err) {
    console.error(`fetch-places failed: ${(err as Error).message}`);
  }

  try {
    run("compute-scores.ts");
  } catch (err) {
    console.error(`compute-scores failed: ${(err as Error).message}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nRefresh complete in ${elapsed}s`);
}

main().catch(console.error);
