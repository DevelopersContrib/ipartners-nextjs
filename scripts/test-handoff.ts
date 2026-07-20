/**
 * Verifies the DomainDirectory → iPartner hand-off token contract,
 * including its security properties. Cleans up after itself.
 *
 *   npm run test:handoff
 */
import { signHandoff, verifyHandoff, redeemHandoff } from "../src/lib/handoff";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let pass = 0;
let fail = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = String(actual) === String(expected);
  console.log(`${ok ? "  ✓" : "  ✗"} ${label} → ${actual}${ok ? "" : ` (expected ${expected})`}`);
  ok ? pass++ : fail++;
}

async function main() {
  const email = `handoff-test-${Date.now()}@test.local`;

  console.log("\n1) A signed token verifies and carries its payload");
  const token = signHandoff({ email, domain: "blockbeam.com", type: "sponsorship", name: "Test Co" });
  if (!token) {
    console.error("DD_HANDOFF_SECRET is not set — cannot run these tests.");
    process.exit(1);
  }
  const v = verifyHandoff(token);
  check("verifies", v.ok, true);
  if (v.ok) {
    check("email", v.payload.email, email);
    check("domain", v.payload.domain, "blockbeam.com");
    check("type", v.payload.type, "sponsorship");
  }

  console.log("\n2) Tampering with the payload is rejected (the core guarantee)");
  const [body, sig] = token.split(".");
  const evil = JSON.parse(Buffer.from(body, "base64url").toString());
  evil.email = "attacker@evil.com";
  const forged = Buffer.from(JSON.stringify(evil)).toString("base64url") + "." + sig;
  const f = verifyHandoff(forged);
  check("forged token rejected", f.ok, false);
  if (!f.ok) check("reason", f.reason, "bad_signature");

  console.log("\n3) An expired token is rejected");
  const expired = signHandoff({ email, domain: "x.com" }, -1000)!;
  const e = verifyHandoff(expired);
  check("expired rejected", e.ok, false);
  if (!e.ok) check("reason", e.reason, "expired");

  console.log("\n4) Garbage is rejected without throwing");
  check("garbage rejected", verifyHandoff("not-a-token").ok, false);
  check("empty rejected", verifyHandoff("").ok, false);

  console.log("\n5) Single-use — a token cannot be replayed");
  const once = signHandoff({ email, domain: "replay.com" })!;
  const first = await redeemHandoff(once);
  check("first redemption succeeds", first.ok, true);
  const second = await redeemHandoff(once);
  check("replay rejected", second.ok, false);
  if (!second.ok) check("reason", second.reason, "already_used");

  // cleanup
  const del = await prisma.ippAuthCode.deleteMany({ where: { email } });
  console.log(`\ncleanup: removed ${del.count} nonce row(s)`);
  console.log(`${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed`);
  await prisma.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error("test crashed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
