/**
 * Reconcile approved → active from published MarketPartnership (read-only).
 *
 * Usage:
 *   pnpm run reconcile:active
 *   pnpm run reconcile:active -- --dry-run
 *   pnpm run reconcile:active -- --limit=100
 *
 * Never writes MarketPartnership.
 */
import { reconcileApprovedToActive } from "../src/lib/reconcile-active";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1] || "500", 10) : 500;

  const result = await reconcileApprovedToActive({ dryRun, limit });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
