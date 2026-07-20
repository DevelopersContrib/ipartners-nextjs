import "server-only";
import { prisma } from "./db";

/**
 * Everything we already know about a partner, so they never retype it.
 *
 * Sources, in priority order:
 *   1. Their most recent prior application (richest — phone, industry, country)
 *   2. The contrib `Members` record (authoritative identity)
 *
 * ⚠️ country/industry are stored inconsistently across the estate:
 *      Members.Country            -> NAME  ("United States", "philippines")
 *      iPartner_Domain.country    -> INT id
 *      iPartner_*.country         -> VARCHAR holding an id ("147")
 *    The form's <select> is keyed by ID, so we return the raw value plus a hint
 *    and let the client resolve it against the loaded options (see resolveOption
 *    in ApplicationForm). Prefilling an unmatched value would silently blank the
 *    field, which is worse than leaving it empty.
 */

export type PartnerProfile = {
  email: string;
  firstname: string;
  lastname: string;
  company: string;
  /** Either a numeric id or a country name — the client resolves it. */
  country: string;
  /** Either a numeric id or an industry name — the client resolves it. */
  industry: string;
  phone: string;
  /** Where we found the richest data (for debugging / telemetry). */
  source: "application" | "member" | "none";
};

const s = (v: unknown) => (v == null ? "" : String(v).trim());

export async function getPartnerProfile(email: string): Promise<PartnerProfile> {
  const e = email.trim().toLowerCase();
  const empty: PartnerProfile = {
    email: e,
    firstname: "",
    lastname: "",
    company: "",
    country: "",
    industry: "",
    phone: "",
    source: "none",
  };
  if (!e) return empty;

  try {
    const [member, general, domain, appLeader, product, venture] = await Promise.all([
      prisma.members.findFirst({
        where: { EmailAddress: e },
        select: { FirstName: true, LastName: true, CompanyName: true, Country: true },
      }),
      prisma.iPartner.findFirst({
        where: { email: e },
        orderBy: { date_submitted: "desc" },
        select: { firstname: true, lastname: true, employer: true, industry: true, phone: true, location: true },
      }),
      prisma.iPartner_Domain.findFirst({
        where: { email: e },
        orderBy: { date_submitted: "desc" },
        select: {
          first_name: true, last_name: true, company: true, phone_number: true,
          country: true, industry_id: true, date_submitted: true,
        },
      }),
      prisma.iPartner_AppLeader.findFirst({
        where: { email: e },
        orderBy: { date_submitted: "desc" },
        select: { fname: true, lname: true, industry: true, date_submitted: true },
      }),
      prisma.iPartner_ProductService.findFirst({
        where: { email: e },
        orderBy: { date_submitted: "desc" },
        select: { fname: true, lname: true, company: true, date_submitted: true },
      }),
      prisma.iPartner_VentureLeader.findFirst({
        where: { email: e },
        orderBy: { date_submitted: "desc" },
        select: { fname: true, lname: true, industry: true, date_submitted: true },
      }),
    ]);

    // Merge: first non-empty wins, applications before the member record.
    const pick = (...vals: unknown[]) => vals.map(s).find((v) => v !== "") ?? "";

    const firstname = pick(
      general?.firstname, domain?.first_name, appLeader?.fname, product?.fname, venture?.fname,
      member?.FirstName,
    );
    const lastname = pick(
      general?.lastname, domain?.last_name, appLeader?.lname, product?.lname, venture?.lname,
      member?.LastName,
    );
    const company = pick(general?.employer, domain?.company, product?.company, member?.CompanyName);
    // These columns are NOT NULL ints, so "no answer" is stored as 0 — which
    // would otherwise resolve to a real option id or silently blank the select.
    const id = (n: number | null | undefined) => (n && n > 0 ? String(n) : "");

    const industry = pick(id(domain?.industry_id), general?.industry, appLeader?.industry, venture?.industry);
    const phone = pick(general?.phone, domain?.phone_number);
    // A prior application's country is already an option id, so prefer it over
    // Members.Country, which is a dirty free-text name we have to match on.
    // (IPartner.location is free text too — too unreliable to prefill from.)
    const country = pick(id(domain?.country), member?.Country);

    const hasApplication = !!(general || domain || appLeader || product || venture);
    const source: PartnerProfile["source"] = hasApplication ? "application" : member ? "member" : "none";

    return { email: e, firstname, lastname, company, country, industry, phone, source };
  } catch (err) {
    // Never let a profile lookup break the application form.
    console.error("[partner-profile] lookup failed:", err);
    return empty;
  }
}
