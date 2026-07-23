/**
 * Idempotent backfill of ipp_engagement from legacy tables.
 * Usage:
 *   npx tsx --env-file=.env scripts/backfill-engagements.ts
 *   npx tsx --env-file=.env scripts/backfill-engagements.ts --dry-run
 *
 * Never writes mode=sponsor. Never writes MarketPartnership.
 */
import { PrismaClient } from "@prisma/client";

const dryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();
const CHUNK = 500;

type Row = {
  email: string;
  memberId: bigint | null;
  mode: string;
  scopeValue: string | null;
  status: string;
  sourceTable: string;
  sourceId: bigint;
};

function normStatus(raw: unknown): string {
  if (raw == null) return "pending";
  if (typeof raw === "number" || (typeof raw === "bigint" && true)) {
    const n = Number(raw);
    if (n === 1 || n === 2) return "approved";
    return "pending";
  }
  const s = String(raw).trim().toLowerCase();
  if (!s || s === "new" || s === "0") return "pending";
  if (["approved", "active", "live"].includes(s)) return "approved";
  if (["declined", "rejected"].includes(s)) return "declined";
  return "pending";
}

function isJunkEmail(email: string) {
  const e = email.toLowerCase();
  return !e.includes("@") || e.includes("localhost") || e.includes("example.com");
}

function isJunkScope(v: string | null | undefined) {
  if (!v) return false;
  const s = v.toLowerCase();
  return s.includes("localhost") || s.includes("http://") || s.includes("https://");
}

async function upsertChunk(rows: Row[]) {
  if (!rows.length) return 0;
  if (dryRun) return rows.length;
  // skipDuplicates relies on uq_source — re-runs are no-ops for existing rows.
  const result = await prisma.ippEngagement.createMany({
    data: rows.map((r) => ({
      email: r.email,
      memberId: r.memberId,
      mode: r.mode,
      scopeType: "domain",
      scopeValue: r.scopeValue,
      status: r.status,
      sourceTable: r.sourceTable,
      sourceId: r.sourceId,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

async function backfillMarketPartnership(emailByMember: Map<string, string>) {
  let cursor: number | undefined;
  let total = 0;
  let skipped = 0;
  for (;;) {
    const batch = await prisma.marketPartnership.findMany({
      take: CHUNK,
      ...(cursor != null ? { skip: 1, cursor: { partner_id: cursor } } : {}),
      orderBy: { partner_id: "asc" },
      select: {
        partner_id: true,
        domain: true,
        member_id: true,
        approved: true,
      },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1]!.partner_id;

    const rows: Row[] = [];
    for (const r of batch) {
      const mid = r.member_id != null ? String(r.member_id) : "";
      const email = mid ? emailByMember.get(mid) : undefined;
      if (!email || isJunkEmail(email)) {
        skipped++;
        continue;
      }
      const scope = r.domain?.trim() || null;
      if (isJunkScope(scope)) {
        skipped++;
        continue;
      }
      rows.push({
        email,
        memberId: r.member_id,
        mode: "builder",
        scopeValue: scope?.slice(0, 255) ?? null,
        status: r.approved === 1 ? "approved" : "pending",
        sourceTable: "MarketPartnership",
        sourceId: BigInt(r.partner_id),
      });
    }
    total += await upsertChunk(rows);
    process.stdout.write(`\rMarketPartnership… ${total} upserted, ${skipped} skipped`);
  }
  console.log("");
  return { total, skipped };
}

async function main() {
  console.log(dryRun ? "DRY RUN — no writes" : "Applying backfill…");

  const before = {
    MarketPartnership: await prisma.marketPartnership.count(),
    IPartner: await prisma.iPartner.count(),
    Members: await prisma.members.count(),
    iPartner_Domain: await prisma.iPartner_Domain.count(),
    engagements: await prisma.ippEngagement.count(),
  };
  console.log("Counts before:", before);

  // MemberId → email (as string keys for BigInt/Int mismatch)
  const emailByMember = new Map<string, string>();
  let mCursor: number | undefined;
  for (;;) {
    const batch = await prisma.members.findMany({
      take: 2000,
      ...(mCursor != null ? { skip: 1, cursor: { MemberId: mCursor } } : {}),
      orderBy: { MemberId: "asc" },
      select: { MemberId: true, EmailAddress: true },
    });
    if (!batch.length) break;
    mCursor = batch[batch.length - 1]!.MemberId;
    for (const m of batch) {
      const e = m.EmailAddress?.trim().toLowerCase();
      if (e && e.includes("@")) emailByMember.set(String(m.MemberId), e);
    }
  }
  console.log(`Loaded ${emailByMember.size} member emails`);

  const mp = await backfillMarketPartnership(emailByMember);

  const memberIdByEmail = new Map<string, bigint>();
  for (const [mid, email] of emailByMember) {
    if (!memberIdByEmail.has(email)) memberIdByEmail.set(email, BigInt(mid));
  }

  // IPartner
  let ipTotal = 0;
  let ipSkip = 0;
  const partners = await prisma.iPartner.findMany({
    select: {
      ipartner_id: true,
      email: true,
      domain_name: true,
      status: true,
      resources: true,
      concept_ideas: true,
    },
  });
  const ipRows: Row[] = [];
  for (const r of partners) {
    const email = r.email?.trim().toLowerCase() || "";
    if (isJunkEmail(email) || isJunkScope(r.domain_name) || isJunkScope(r.resources) || isJunkScope(r.concept_ideas)) {
      ipSkip++;
      continue;
    }
    ipRows.push({
      email,
      memberId: memberIdByEmail.get(email) ?? null,
      mode: "builder",
      scopeValue: r.domain_name?.slice(0, 255) || null,
      status: normStatus(r.status),
      sourceTable: "IPartner",
      sourceId: BigInt(r.ipartner_id),
    });
  }
  for (let i = 0; i < ipRows.length; i += CHUNK) {
    ipTotal += await upsertChunk(ipRows.slice(i, i + CHUNK));
  }
  console.log(`IPartner: ${ipTotal} inserted, ${ipSkip} skipped`);

  async function typed(
    sourceTable: string,
    mode: string,
    rows: {
      id: number;
      email: string | null;
      domain: string | null;
      status: unknown;
    }[],
  ) {
    let total = 0;
    let skipped = 0;
    const out: Row[] = [];
    for (const r of rows) {
      const email = r.email?.trim().toLowerCase() || "";
      if (isJunkEmail(email) || isJunkScope(r.domain)) {
        skipped++;
        continue;
      }
      out.push({
        email,
        memberId: memberIdByEmail.get(email) ?? null,
        mode,
        scopeValue: r.domain?.slice(0, 255) || null,
        status: normStatus(r.status),
        sourceTable,
        sourceId: BigInt(r.id),
      });
    }
    for (let i = 0; i < out.length; i += CHUNK) {
      total += await upsertChunk(out.slice(i, i + CHUNK));
    }
    console.log(`${sourceTable}: ${total} inserted, ${skipped} skipped`);
    return total;
  }

  // Raw queries — Prisma struggles with MySQL ENUM status columns on these tables.
  type RawRow = { id: number; email: string | null; domain: string | null; status: unknown };
  const domains = await prisma.$queryRaw<RawRow[]>`
    SELECT ipartner_domain_id AS id, email, domain, CAST(status AS CHAR) AS status
    FROM iPartner_Domain`;
  await typed("iPartner_Domain", "domain_owner", domains);

  const apps = await prisma.$queryRaw<RawRow[]>`
    SELECT ipartner_id AS id, email, domain, CAST(app_status AS CHAR) AS status
    FROM iPartner_AppLeader`;
  await typed("iPartner_AppLeader", "app", apps);

  const ventures = await prisma.$queryRaw<RawRow[]>`
    SELECT ipartner_id AS id, email, domain, CAST(app_status AS CHAR) AS status
    FROM iPartner_VentureLeader`;
  await typed("iPartner_VentureLeader", "operator", ventures);

  const products = await prisma.$queryRaw<RawRow[]>`
    SELECT ipartner_id AS id, email, domain, CAST(app_status AS CHAR) AS status
    FROM iPartner_ProductService`;
  await typed("iPartner_ProductService", "vendor", products);

  const after = {
    MarketPartnership: await prisma.marketPartnership.count(),
    IPartner: await prisma.iPartner.count(),
    Members: await prisma.members.count(),
    iPartner_Domain: await prisma.iPartner_Domain.count(),
    engagements: await prisma.ippEngagement.count(),
    sponsors: await prisma.ippEngagement.count({ where: { mode: "sponsor" } }),
  };
  console.log("Counts after:", after);
  console.log("MarketPartnership upserted:", mp.total, "skipped:", mp.skipped);

  if (after.MarketPartnership !== before.MarketPartnership) throw new Error("MarketPartnership count changed!");
  if (after.IPartner !== before.IPartner) throw new Error("IPartner count changed!");
  if (after.Members !== before.Members) throw new Error("Members count changed!");
  if (after.iPartner_Domain !== before.iPartner_Domain) throw new Error("iPartner_Domain count changed!");
  if (after.sponsors !== 0) throw new Error("Found mode=sponsor rows — forbidden");

  // Idempotency check hint
  console.log("OK — legacy counts unchanged, zero sponsors.");
  if (!dryRun) {
    console.log("Re-run this script to confirm engagement count stays", after.engagements);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
