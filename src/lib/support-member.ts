import { prisma } from "@/lib/db";

/** Normalized member shape used by support ticket libs. */
export type SupportMember = {
  id: number;
  email: string;
  name: string;
  plan_id: number | null;
  plan_expiry: Date | null;
};

function displayName(first?: string | null, last?: string | null, company?: string | null) {
  const n = [first, last].filter(Boolean).join(" ").trim();
  return n || company?.trim() || "";
}

export async function findSupportMemberByEmail(email: string): Promise<SupportMember | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const row = await prisma.members.findFirst({
    where: { EmailAddress: normalized },
    select: {
      MemberId: true,
      EmailAddress: true,
      FirstName: true,
      LastName: true,
      CompanyName: true,
    },
  });
  if (!row?.EmailAddress) return null;
  return {
    id: row.MemberId,
    email: row.EmailAddress,
    name: displayName(row.FirstName, row.LastName, row.CompanyName),
    plan_id: null,
    plan_expiry: null,
  };
}

export async function findSupportMemberById(id: number): Promise<SupportMember | null> {
  if (!Number.isFinite(id)) return null;
  const row = await prisma.members.findUnique({
    where: { MemberId: id },
    select: {
      MemberId: true,
      EmailAddress: true,
      FirstName: true,
      LastName: true,
      CompanyName: true,
    },
  });
  if (!row?.EmailAddress) return null;
  return {
    id: row.MemberId,
    email: row.EmailAddress,
    name: displayName(row.FirstName, row.LastName, row.CompanyName),
    plan_id: null,
    plan_expiry: null,
  };
}
