/**
 * Prefill option resolution — the country/industry <select>s are keyed by id,
 * but our stored values are a mix of ids and (inconsistently cased) names.
 *   pnpm tsx scripts/test-prefill.ts
 */
import { resolveOption } from "../src/components/ApplicationForm";

const COUNTRIES = [
  { id: "1", name: "United States" },
  { id: "147", name: "Philippines" },
  { id: "99", name: "India" },
];
const INDUSTRIES = [
  { id: "5", name: "Technology" },
  { id: "12", name: "Real Estate" },
];

let pass = 0;
let fail = 0;
function eq(label: string, actual: string, expected: string) {
  if (actual === expected) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

console.log("resolveOption");
// iPartner_* tables store the id in a varchar.
eq("numeric id matches", resolveOption("147", COUNTRIES), "147");
// Members.Country stores the display name.
eq("exact name matches", resolveOption("United States", COUNTRIES), "1");
// Members.Country casing is dirty in production ("philippines", 3,443 rows).
eq("lower-cased name matches", resolveOption("philippines", COUNTRIES), "147");
eq("upper-cased name matches", resolveOption("INDIA", COUNTRIES), "99");
eq("surrounding whitespace tolerated", resolveOption("  India  ", COUNTRIES), "99");

// Anything we can't map must come back empty rather than being forced into the
// field — a wrong preselection is worse than an unfilled one.
eq("unknown name yields empty", resolveOption("Atlantis", COUNTRIES), "");
eq("unknown id yields empty", resolveOption("99999", COUNTRIES), "");
eq("empty input yields empty", resolveOption("", COUNTRIES), "");
eq("undefined input yields empty", resolveOption(undefined, COUNTRIES), "");
// Options load async — before they arrive there is nothing to match against.
eq("no options yields empty", resolveOption("United States", []), "");

eq("industry by name", resolveOption("Real Estate", INDUSTRIES), "12");
eq("industry by id", resolveOption("5", INDUSTRIES), "5");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
