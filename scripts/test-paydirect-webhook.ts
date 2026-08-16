import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  dispatchPaydirectWebhook,
  paydirectWebhookAuthError,
  verifyPaydirectSignature,
  type PaydirectFulfillInput,
} from "../src/lib/paydirect-webhook";
import { resolvePaydirectStatus } from "../src/lib/paydirect";

const secret = "whsec_fixture_only";
const baseData = {
  id: "fixture-payment-1",
  grossAmount: "500.00",
  paymentMethod: "crypto",
  metadata: {
    product: "ipartner_sponsor",
    email: "fixture@example.com",
    tier: "bronze",
    vertical: "ai",
    scope_type: "vertical",
    scope_value: "ai",
  },
};

async function main() {
const raw = JSON.stringify({ event: "payment.confirmed", data: baseData });
const signature = createHmac("sha256", secret).update(raw).digest("hex");

assert.equal(verifyPaydirectSignature(secret, raw, signature), true);
assert.equal(verifyPaydirectSignature(secret, `${raw} `, signature), false);
assert.equal(verifyPaydirectSignature(secret, raw, "not-hex"), false);
assert.deepEqual(paydirectWebhookAuthError(undefined, raw, signature), {
  status: 503,
  error: "PayDirect webhook is not configured",
});
assert.deepEqual(paydirectWebhookAuthError(secret, raw, "0".repeat(64)), {
  status: 401,
  error: "Invalid signature",
});
assert.equal(paydirectWebhookAuthError(secret, raw, signature), null);

const expectedStatuses = [
  "created",
  "confirmed",
  "forwarded",
  "failed",
  "expired",
] as const;

for (const status of expectedStatuses) {
  const calls: PaydirectFulfillInput[] = [];
  const event = `payment.${status}`;
  const body = JSON.stringify({ event, data: baseData });
  const result = await dispatchPaydirectWebhook(body, null, async (input) => {
    calls.push(input);
  });

  assert.equal(result.ok, true, `${event} should dispatch`);
  assert.equal(calls.length, 1, `${event} should fulfill once`);
  assert.equal(calls[0].status, status);
  assert.equal(calls[0].providerPaymentId, baseData.id);
  assert.equal(calls[0].amount, baseData.grossAmount);
}

const overrideCalls: PaydirectFulfillInput[] = [];
await dispatchPaydirectWebhook(
  JSON.stringify({ event: "payment.created", data: baseData }),
  "payment.forwarded",
  async (input) => {
    overrideCalls.push(input);
  },
);
assert.equal(overrideCalls[0].status, "forwarded", "signed header event wins");

let ignoredCalls = 0;
const ignored = await dispatchPaydirectWebhook(
  JSON.stringify({ event: "workspace.updated", data: baseData }),
  null,
  async () => {
    ignoredCalls += 1;
  },
);
assert.deepEqual(ignored, {
  ok: true,
  ignored: true,
  event: "workspace.updated",
});
assert.equal(ignoredCalls, 0);

assert.deepEqual(
  await dispatchPaydirectWebhook("{", null, async () => {}),
  { ok: false, status: 400, error: "Invalid JSON" },
);
assert.deepEqual(
  await dispatchPaydirectWebhook(
    JSON.stringify({ event: "payment.confirmed", data: {} }),
    null,
    async () => {},
  ),
  { ok: false, status: 400, error: "missing payment id" },
);
await assert.rejects(
  dispatchPaydirectWebhook(raw, null, async () => ({
    ok: false,
    reason: "payment not recorded yet",
  })),
  /payment not recorded yet/,
);

assert.equal(resolvePaydirectStatus("created", "confirmed"), "confirmed");
assert.equal(resolvePaydirectStatus("confirmed", "created"), "confirmed");
assert.equal(resolvePaydirectStatus("confirmed", "failed"), "confirmed");
assert.equal(resolvePaydirectStatus("confirmed", "forwarded"), "forwarded");
assert.equal(resolvePaydirectStatus("forwarded", "confirmed"), "forwarded");
assert.equal(resolvePaydirectStatus("failed", "created"), "failed");
assert.equal(resolvePaydirectStatus("created", "made-up"), "created");

console.log("PayDirect webhook fixtures passed");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
