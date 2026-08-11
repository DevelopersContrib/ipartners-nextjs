/**
 * Run status-tied auto messages (pending / stalled-approved nudges).
 *
 *   pnpm run auto:messages -- --dry-run
 *   pnpm run auto:messages -- --limit=50
 */
import { runAutoMessages } from "../src/lib/auto-messages";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1] || "100", 10) : 100;

  const result = await runAutoMessages({ dryRun, limit });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
