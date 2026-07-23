import "server-only";
import { prisma } from "./db";
import type { EngagementMode } from "./engagement-modes";

export {
  ENGAGEMENT_MODES,
  MODE_LABELS,
  coerceMode,
  statusLabel,
  normalizeStatus,
  type EngagementMode,
} from "./engagement-modes";

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
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");

  let memberId = input.memberId ?? null;
  if (memberId == null) {
    const member = await prisma.members.findFirst({
      where: { EmailAddress: email },
      select: { MemberId: true },
    });
    memberId = member?.MemberId ?? null;
  }

  if (input.sourceTable && input.sourceId != null) {
    return prisma.ippEngagement.upsert({
      where: {
        sourceTable_sourceId: {
          sourceTable: input.sourceTable,
          sourceId: BigInt(input.sourceId),
        },
      },
      create: {
        email,
        memberId: memberId != null ? BigInt(memberId) : null,
        mode: input.mode,
        scopeType: input.scopeType ?? "domain",
        scopeValue: input.scopeValue?.slice(0, 255) || null,
        status: input.status ?? "pending",
        tier: input.tier ?? null,
        sourceTable: input.sourceTable,
        sourceId: BigInt(input.sourceId),
      },
      update: {
        email,
        memberId: memberId != null ? BigInt(memberId) : null,
        mode: input.mode,
        scopeValue: input.scopeValue?.slice(0, 255) || null,
        status: input.status ?? "pending",
      },
    });
  }

  return prisma.ippEngagement.create({
    data: {
      email,
      memberId: memberId != null ? BigInt(memberId) : null,
      mode: input.mode,
      scopeType: input.scopeType ?? "domain",
      scopeValue: input.scopeValue?.slice(0, 255) || null,
      status: input.status ?? "pending",
      tier: input.tier ?? null,
    },
  });
}
