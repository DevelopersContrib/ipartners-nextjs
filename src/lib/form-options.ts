import type { FormOption, SignupFormData } from "./types";

/** Local fallback when Contrib signup-form API is down or returns junk. */
export const FALLBACK_FORM_DATA: SignupFormData = {
  roles: [
    { id: "1", name: "Advisor" },
    { id: "2", name: "Co-founder" },
    { id: "3", name: "Content Creator" },
    { id: "4", name: "Designer" },
    { id: "5", name: "Developer" },
    { id: "6", name: "Engineer" },
    { id: "7", name: "Investor" },
    { id: "8", name: "Marketing" },
    { id: "9", name: "Operations" },
    { id: "10", name: "Product Manager" },
    { id: "11", name: "Sales" },
    { id: "12", name: "Strategy" },
    { id: "13", name: "Other" },
  ],
  industries: [
    { id: "1", name: "Technology" },
    { id: "2", name: "Finance" },
    { id: "3", name: "Healthcare" },
    { id: "4", name: "Education" },
    { id: "5", name: "E-commerce" },
    { id: "6", name: "Media & Entertainment" },
    { id: "7", name: "Real Estate" },
    { id: "8", name: "Consulting" },
    { id: "9", name: "Marketing & Advertising" },
    { id: "10", name: "Other" },
  ],
  experiences: [
    { id: "1", name: "Less than 1 year" },
    { id: "2", name: "1-3 years" },
    { id: "3", name: "3-5 years" },
    { id: "4", name: "5-10 years" },
    { id: "5", name: "10+ years" },
  ],
  intentions: [
    { id: "1", name: "Build & Grow" },
    { id: "2", name: "Invest & Earn" },
  ],
};

/** Minimal country list when Getcountry fails (id = common ISO-ish codes). */
export const FALLBACK_COUNTRIES: FormOption[] = [
  { id: "US", name: "United States" },
  { id: "GB", name: "United Kingdom" },
  { id: "CA", name: "Canada" },
  { id: "AU", name: "Australia" },
  { id: "PH", name: "Philippines" },
  { id: "IN", name: "India" },
  { id: "SG", name: "Singapore" },
  { id: "DE", name: "Germany" },
  { id: "FR", name: "France" },
  { id: "NL", name: "Netherlands" },
  { id: "AE", name: "United Arab Emirates" },
  { id: "OTHER", name: "Other" },
];

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Coerce messy Contrib option shapes into { id, name }. */
export function normalizeFormOption(raw: unknown, index: number): FormOption | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const name = raw.trim();
    return name ? { id: String(index + 1), name } : null;
  }
  const o = asRecord(raw);
  if (!o) return null;
  const id = String(
    o.id ?? o.Id ?? o.ID ?? o.role_id ?? o.industry_id ?? o.value ?? o.code ?? "",
  ).trim();
  const name = String(
    o.name ?? o.Name ?? o.label ?? o.Label ?? o.title ?? o.text ?? "",
  ).trim();
  if (!name) return null;
  return { id: id || String(index + 1), name };
}

function normalizeList(raw: unknown): FormOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => normalizeFormOption(item, i))
    .filter((x): x is FormOption => !!x);
}

/**
 * Accept remote formData only when every list has usable options.
 * Otherwise return the local fallback so selects always work.
 */
export function resolveFormData(raw: unknown): SignupFormData {
  const o = asRecord(raw);
  if (!o) return FALLBACK_FORM_DATA;

  const roles = normalizeList(o.roles ?? o.Roles ?? o.role);
  const industries = normalizeList(o.industries ?? o.Industries ?? o.industry);
  const experiences = normalizeList(
    o.experiences ?? o.Experiences ?? o.experience,
  );
  const intentions = normalizeList(
    o.intentions ?? o.Intentions ?? o.intention,
  );

  if (
    roles.length === 0 ||
    industries.length === 0 ||
    experiences.length === 0 ||
    intentions.length === 0
  ) {
    return FALLBACK_FORM_DATA;
  }

  return { roles, industries, experiences, intentions };
}

export function labelForOption(
  options: FormOption[],
  idOrName: string | null | undefined,
): string {
  const v = (idOrName || "").trim();
  if (!v) return "";
  const byId = options.find((o) => String(o.id) === v);
  if (byId) return byId.name;
  const lower = v.toLowerCase();
  const byName = options.find((o) => o.name.toLowerCase() === lower);
  return byName?.name || v;
}
