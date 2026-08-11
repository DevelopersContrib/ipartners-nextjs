import "server-only";
import { prisma } from "./db";
import { FALLBACK_FORM_DATA, labelForOption } from "./form-options";

export type ApplicationField = {
  label: string;
  value: string;
};

export type ApplicationDetail = {
  source: "engagement_json" | "ipartner" | "ipartner_domain" | "none";
  title: string;
  fields: ApplicationField[];
};

function s(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function push(fields: ApplicationField[], label: string, value: unknown) {
  const v = s(value);
  if (!v) return;
  fields.push({ label, value: v });
}

function parseJson(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw?.trim()) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Build a human-readable application review panel for admins. */
export async function getApplicationDetail(opts: {
  email: string;
  sourceTable: string | null;
  sourceId: bigint | null;
  applicationJson: string | null;
}): Promise<ApplicationDetail> {
  const fields: ApplicationField[] = [];
  const json = parseJson(opts.applicationJson);

  if (json) {
    const role = labelForOption(FALLBACK_FORM_DATA.roles, s(json.role));
    const industry = labelForOption(
      FALLBACK_FORM_DATA.industries,
      s(json.industry),
    );
    const experience = labelForOption(
      FALLBACK_FORM_DATA.experiences,
      s(json.experience),
    );
    const intention = labelForOption(
      FALLBACK_FORM_DATA.intentions,
      s(json.intention),
    );

    push(fields, "First name", json.firstname ?? json.firstName);
    push(fields, "Last name", json.lastname ?? json.lastName);
    push(fields, "Email", json.email);
    push(fields, "Phone", json.phone);
    push(fields, "Company / employer", json.company ?? json.employer);
    push(fields, "Domain", json.domain ?? json.domain_name ?? json.domainName);
    push(fields, "Country", json.country);
    push(fields, "Role", role || json.role);
    push(fields, "Industry", industry || json.industry);
    push(fields, "Experience", experience || json.experience);
    push(fields, "Intention", intention || json.intention);
    push(fields, "Partnership type", json.partnershipType);
    push(fields, "Mode", json.mode);
    push(fields, "Vertical", json.vertical);
    push(fields, "Tier", json.tier);
    push(fields, "Referral source", json.referral_source ?? json.referralSource);
    push(fields, "LinkedIn", json.linkedIn ?? json.linkedin);
    push(fields, "Time commitment", json.timeCommitment ?? json.time_commitment);
    push(fields, "Areas of expertise", json.areasOfExpertise ?? json.areas_of_expertise);
    push(fields, "Ideas / monetization", json.ideasMonetization ?? json.concept_ideas);
    push(fields, "Resources bringing", json.resourcesBringing ?? json.resources);
    push(fields, "Resources needed", json.resourcesToolsNeeded ?? json.resources_needed);
    push(fields, "Partnership goals", json.partnershipGoalsShortLong ?? json.partnership_goals);
    push(fields, "Business advice", json.businessAdviceYoung ?? json.business_advice);
    push(fields, "Expectations", json.expectationsContrib ?? json.expectations);
    push(fields, "Message", json.message);

    // Any leftover custom keys
    for (const [k, v] of Object.entries(json)) {
      if (
        [
          "firstname", "firstName", "lastname", "lastName", "email", "phone",
          "company", "employer", "domain", "domain_name", "domainName", "country",
          "role", "industry", "experience", "intention", "partnershipType", "mode",
          "vertical", "tier", "referral_source", "referralSource", "linkedIn",
          "linkedin", "timeCommitment", "time_commitment", "areasOfExpertise",
          "areas_of_expertise", "ideasMonetization", "concept_ideas",
          "resourcesBringing", "resources", "resourcesToolsNeeded", "resources_needed",
          "partnershipGoalsShortLong", "partnership_goals", "businessAdviceYoung",
          "business_advice", "expectationsContrib", "expectations", "message",
        ].includes(k)
      ) {
        continue;
      }
      push(fields, k.replace(/_/g, " "), v);
    }

    if (fields.length > 0) {
      return {
        source: "engagement_json",
        title: "What they submitted",
        fields,
      };
    }
  }

  // Legacy IPartner row linked by source
  if (opts.sourceTable === "IPartner" && opts.sourceId != null) {
    const row = await prisma.iPartner.findUnique({
      where: { ipartner_id: Number(opts.sourceId) },
    });
    if (row) {
      push(fields, "First name", row.firstname);
      push(fields, "Last name", row.lastname);
      push(fields, "Email", row.email);
      push(fields, "Phone", row.phone);
      push(fields, "LinkedIn", row.linkedin);
      push(fields, "Employer", row.employer);
      push(fields, "Location", row.location);
      push(fields, "Domain", row.domain_name);
      push(fields, "Industry", row.industry);
      push(fields, "Time commitment", row.time_commitment);
      push(fields, "Areas of expertise", row.areas_of_expertise);
      push(fields, "Concept / ideas", row.concept_ideas);
      push(fields, "Resources bringing", row.resources);
      push(fields, "Partnership goals", row.partnership_goals);
      push(fields, "Business advice", row.business_advice);
      push(fields, "Resources needed", row.resources_needed);
      push(fields, "Expectations", row.expectations);
      push(
        fields,
        "Submitted",
        row.date_submitted?.toISOString().slice(0, 10),
      );
      return {
        source: "ipartner",
        title: `IPartner application #${row.ipartner_id}`,
        fields,
      };
    }
  }

  // Fallback: latest IPartner / Domain application by email
  const email = opts.email.trim().toLowerCase();
  if (email) {
    type DomainRow = {
      ipartner_domain_id: number;
      first_name: string | null;
      last_name: string | null;
      company: string | null;
      title: string;
      phone_number: string | null;
      country: number;
      industry_id: number;
      email: string | null;
      domain: string | null;
      domains_owned: string | null;
      develop_or_sell: string | null;
      date_submitted: Date | null;
    };

    let general: Awaited<
      ReturnType<typeof prisma.iPartner.findFirst>
    > = null;
    let domain: DomainRow | null = null;
    try {
      general = await prisma.iPartner.findFirst({
        where: { email },
        orderBy: { date_submitted: "desc" },
      });
    } catch (err) {
      console.error("[application-detail] IPartner lookup failed:", err);
    }
    try {
      // Avoid selecting legacy enum-ish status values that break Prisma decode.
      domain = await prisma.iPartner_Domain.findFirst({
        where: { email },
        orderBy: { date_submitted: "desc" },
        select: {
          ipartner_domain_id: true,
          first_name: true,
          last_name: true,
          company: true,
          title: true,
          phone_number: true,
          country: true,
          industry_id: true,
          email: true,
          domain: true,
          domains_owned: true,
          develop_or_sell: true,
          date_submitted: true,
        },
      });
    } catch (err) {
      console.error("[application-detail] iPartner_Domain lookup failed:", err);
    }

    if (general) {
      push(fields, "First name", general.firstname);
      push(fields, "Last name", general.lastname);
      push(fields, "Phone", general.phone);
      push(fields, "LinkedIn", general.linkedin);
      push(fields, "Employer", general.employer);
      push(fields, "Location", general.location);
      push(fields, "Domain", general.domain_name);
      push(fields, "Industry", general.industry);
      push(fields, "Time commitment", general.time_commitment);
      push(fields, "Areas of expertise", general.areas_of_expertise);
      push(fields, "Concept / ideas", general.concept_ideas);
      push(fields, "Resources bringing", general.resources);
      push(fields, "Partnership goals", general.partnership_goals);
      push(fields, "Business advice", general.business_advice);
      push(fields, "Resources needed", general.resources_needed);
      push(fields, "Expectations", general.expectations);
      return {
        source: "ipartner",
        title: `Latest IPartner application #${general.ipartner_id}`,
        fields,
      };
    }

    if (domain) {
      push(fields, "First name", domain.first_name);
      push(fields, "Last name", domain.last_name);
      push(fields, "Company", domain.company);
      push(fields, "Title", domain.title);
      push(fields, "Phone", domain.phone_number);
      push(fields, "Domain", domain.domain);
      push(fields, "Domains owned", domain.domains_owned);
      push(fields, "Develop or sell", domain.develop_or_sell);
      push(fields, "Country id", domain.country > 0 ? String(domain.country) : "");
      push(
        fields,
        "Industry id",
        domain.industry_id > 0 ? String(domain.industry_id) : "",
      );
      return {
        source: "ipartner_domain",
        title: `Domain application #${domain.ipartner_domain_id}`,
        fields,
      };
    }
  }

  return {
    source: "none",
    title: "Application answers",
    fields: [],
  };
}
