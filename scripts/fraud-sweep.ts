/**
 * CLI fraud sweep (same logic as /admin auto-decline, no session required).
 *
 *   pnpm exec tsx --conditions=react-server --env-file=.env scripts/fraud-sweep.ts --dry-run
 *   pnpm exec tsx --conditions=react-server --env-file=.env scripts/fraud-sweep.ts --apply
 */
import { prisma } from "../src/lib/db";
import {
  heuristicFraudSignal,
  shouldAutoDecline,
  aiFraudSignal,
  isFraudAiConfigured,
} from "../src/lib/fraud-screen";
import { getApplicationDetail } from "../src/lib/application-detail";

const dryRun =
  process.argv.includes("--dry-run") || !process.argv.includes("--apply");
const useAi = !process.argv.includes("--no-ai") && isFraudAiConfigured();
const heuristicsOnly = process.argv.includes("--heuristics-only");

async function main() {
  console.log(
    JSON.stringify({
      dryRun,
      useAi: useAi && !heuristicsOnly,
      heuristicsOnly,
      mode: dryRun ? "preview" : "APPLY",
    }),
  );

  const pending = await prisma.ippEngagement.findMany({
    where: { status: "pending" },
    orderBy: { id: "asc" },
    take: 5000,
    select: {
      id: true,
      email: true,
      mode: true,
      scopeValue: true,
      tier: true,
      sourceTable: true,
      sourceId: true,
      applicationJson: true,
    },
  });

  const hits: {
    id: string;
    email: string;
    reason: string;
    layer: string;
    confidence: number;
  }[] = [];
  const toDecline: bigint[] = [];
  const needsAi: typeof pending = [];
  const appTextById = new Map<string, string>();

  for (const row of pending) {
    const quick = heuristicFraudSignal({
      email: row.email,
      scopeValue: row.scopeValue,
    });
    if (quick && shouldAutoDecline(quick)) {
      hits.push({
        id: String(row.id),
        email: row.email,
        reason: quick.reason,
        layer: quick.layer,
        confidence: quick.confidence,
      });
      toDecline.push(row.id);
      continue;
    }
    needsAi.push(row);
  }

  if (useAi && !heuristicsOnly) {
    // AI on newest 25 non-heuristic leftovers
    const slice = needsAi.slice(-25);
    for (let i = 0; i < slice.length; i++) {
      const row = slice[i];
      process.stdout.write(`\rAI ${i + 1}/${slice.length}…`);
      const detail = await getApplicationDetail({
        email: row.email,
        sourceTable: row.sourceTable,
        sourceId: row.sourceId,
        applicationJson: row.applicationJson,
      }).catch(() => ({
        fields: [] as { label: string; value: string }[],
        source: "none" as const,
        title: "",
      }));
      const applicationText = detail.fields
        .map((f) => `${f.label}: ${f.value}`)
        .join("\n");
      appTextById.set(String(row.id), applicationText);

      let signal;
      try {
        signal = await aiFraudSignal({
          email: row.email,
          mode: row.mode,
          scopeValue: row.scopeValue,
          tier: row.tier,
          applicationText,
        });
      } catch (err) {
        console.error(`[fraud-sweep] AI failed for #${row.id}:`, err);
        continue;
      }
      if (!signal || !shouldAutoDecline(signal)) continue;
      hits.push({
        id: String(row.id),
        email: row.email,
        reason: signal.reason,
        layer: signal.layer,
        confidence: signal.confidence,
      });
      toDecline.push(row.id);
    }
    if (slice.length) process.stdout.write("\n");
  }

  console.log(
    JSON.stringify(
      {
        scanned: pending.length,
        hits: hits.length,
        byLayer: hits.reduce(
          (acc, h) => {
            acc[h.layer] = (acc[h.layer] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        sample: hits.slice(0, 25),
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    console.log("Dry-run only. Re-run with --apply to decline.");
    return;
  }

  if (toDecline.length === 0) {
    console.log("Nothing to decline.");
    return;
  }

  // Chunk updates (MySQL IN list safety)
  let declined = 0;
  const chunk = 200;
  for (let i = 0; i < toDecline.length; i += chunk) {
    const ids = toDecline.slice(i, i + chunk);
    const res = await prisma.ippEngagement.updateMany({
      where: { id: { in: ids }, status: "pending" },
      data: { status: "declined" },
    });
    declined += res.count;
  }
  console.log(`Declined ${declined} (no SES).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
