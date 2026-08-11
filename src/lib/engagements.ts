import "server-only";
import { prisma } from "./db";
import type { EngagementMode } from "./engagement-modes";
import { heuristicFraudSignal } from "./fraud-screen";

export {
  ENGAGEMENT_MODES,
  MODE_LABELS,
  coerceMode,
  statusLabel,
  normalizeStatus,
  type EngagementMode,
} from "./engagement-modes";

export type ApplicationPayload = Record<string, unknown>;

const OPEN_STATUSES = ["pending", "approved"] as const;

/** Normalize scope for intake dedupe (domain or vertical slug). */
export function normalizeScopeKey(raw: string | null | undefined): string {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return "";
  if (s.includes(".")) {
    return s
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .replace(/\.$/, "");
  }
  return s;
}

export function serializeApplicationPayload(
  payload: ApplicationPayload | null | undefined,
): string | null {
  if (!payload || Object.keys(payload).length === 0) return null;
  try {
    return JSON.stringify(payload);
  } catch {
    return null;
  }
}

async function findOpenEngagement(opts: {
  email: string;
  mode: EngagementMode;
  scopeValue: string | null;
}) {
  const scopeKey = normalizeScopeKey(opts.scopeValue);
  const candidates = await prisma.ippEngagement.findMany({
    where: {
      email: opts.email,
      mode: opts.mode,
      status: { in: [...OPEN_STATUSES] },
    },
    orderBy: { id: "desc" },
    take: 25,
  });
  return (
    candidates.find((c) => normalizeScopeKey(c.scopeValue) === scopeKey) ?? null
  );
}

/**
 * Create or refresh an engagement.
 * Dedupe: if an open (pending|approved) row exists for the same email+mode+scope,
 * update it instead of inserting a duplicate from another intake channel.
 */
export async function createEngagement(input: {
  email: string;
  mode: EngagementMode;
  scopeType?: "domain" | "vertical" | "network";
  scopeValue?: string | null;
  status?: string;
  tier?: string | null;
  memberId?: number | null;
  sourceTable?: string | null;
  sourceId?: number | null;
  applicationJson?: ApplicationPayload | string | null;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");

  const applicationJson =
    typeof input.applicationJson === "string"
      ? input.applicationJson.slice(0, 60_000)
      : serializeApplicationPayload(input.applicationJson);

  const scopeValue = input.scopeValue?.slice(0, 255) || null;
  const scopeType = input.scopeType ?? "domain";
  let status = input.status ?? "pending";

  // Intake: disposable / junk emails land as declined (no queue pollution).
  const intakeFraud = heuristicFraudSignal({ email, scopeValue });
  if (
    intakeFraud &&
    intakeFraud.verdict === "decline" &&
    intakeFraud.confidence >= 0.9 &&
    (status === "pending" || !input.status)
  ) {
    status = "declined";
    console.log(
      `[engagement] auto-declined at intake ${email}: ${intakeFraud.reason}`,
    );
  }

  let memberId = input.memberId ?? null;
  if (memberId == null) {
    const member = await prisma.members.findFirst({
      where: { EmailAddress: email },
      select: { MemberId: true },
    });
    memberId = member?.MemberId ?? null;
  }

  const memberIdBig = memberId != null ? BigInt(memberId) : null;

  // Same legacy source → upsert (idempotent backfill / re-submit).
  if (input.sourceTable && input.sourceId != null) {
    const existingSource = await prisma.ippEngagement.findUnique({
      where: {
        sourceTable_sourceId: {
          sourceTable: input.sourceTable,
          sourceId: BigInt(input.sourceId),
        },
      },
    });
    if (existingSource) {
      return prisma.ippEngagement.update({
        where: { id: existingSource.id },
        data: {
          email,
          memberId: memberIdBig,
          mode: input.mode,
          scopeType,
          scopeValue,
          status,
          tier: input.tier ?? existingSource.tier,
          ...(applicationJson ? { applicationJson } : {}),
        },
      });
    }
  }

  // Cross-channel dedupe: same person + domain/vertical + mode still open.
  const open = await findOpenEngagement({
    email,
    mode: input.mode,
    scopeValue,
  });
  if (open) {
    return prisma.ippEngagement.update({
      where: { id: open.id },
      data: {
        memberId: memberIdBig ?? open.memberId,
        scopeType,
        scopeValue: scopeValue ?? open.scopeValue,
        // Don't demote an approved row back to pending on re-apply.
        status: open.status === "approved" ? "approved" : status,
        tier: input.tier ?? open.tier,
        ...(applicationJson ? { applicationJson } : {}),
        ...(input.sourceTable && input.sourceId != null && !open.sourceTable
          ? {
              sourceTable: input.sourceTable,
              sourceId: BigInt(input.sourceId),
            }
          : {}),
      },
    });
  }

  return prisma.ippEngagement.create({
    data: {
      email,
      memberId: memberIdBig,
      mode: input.mode,
      scopeType,
      scopeValue,
      status,
      tier: input.tier ?? null,
      applicationJson,
      ...(input.sourceTable && input.sourceId != null
        ? {
            sourceTable: input.sourceTable,
            sourceId: BigInt(input.sourceId),
          }
        : {}),
    },
  });
}
