"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  PayDirectProvider,
  CheckoutWidget,
  type CheckoutResult,
} from "@paydirectv2/react-widgets";
import type { SponsorScope } from "@/lib/sponsor-pricing";

/** PayDirect only allows its own origin in CORS, so widget calls go through our
 *  proxy at src/app/api/paydirect/[...path]/route.ts, which attaches the key. */
const PAYDIRECT_PROXY_BASE = "/api/paydirect";

export default function SponsorCheckoutWidget({
  amount,
  tier,
  vertical,
  scopeType,
  scopeValue,
  email,
  engagementId,
  returnUrl,
  cancelUrl,
  description,
}: {
  amount: string;
  tier: string;
  /** Category context — sent for both scopes so reporting stays grouped. */
  vertical: string;
  scopeType: SponsorScope;
  scopeValue: string;
  email: string;
  engagementId?: string | null;
  returnUrl: string;
  cancelUrl: string;
  description: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const metadata: Record<string, string> = {
    product: "ipartner_sponsor",
    tier,
    vertical,
    scope_type: scopeType,
    scope_value: scopeValue,
    email,
  };
  if (engagementId) metadata.engagement_id = engagementId;

  const onSuccess = (payment: CheckoutResult) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/sponsor/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: payment.id,
            amount: payment.amount || amount,
            paymentMethod: payment.paymentMethod,
            tier,
            vertical,
            scopeType,
            scopeValue,
            email,
            engagementId: engagementId || undefined,
            status: payment.status || "created",
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error || "Could not save payment locally");
        }
        setDone(true);
        router.push(
          `/checkout/sponsor/success?payment=${encodeURIComponent(payment.id)}&tier=${encodeURIComponent(tier)}`,
        );
      } catch {
        setError("Payment started but local save failed — contact hello@ipartner.com");
        setDone(true);
      }
    });
  };

  return (
    <PayDirectProvider
      apiKey=""
      baseUrl={PAYDIRECT_PROXY_BASE}
      theme="light"
      onError={(err) => setError(err)}
    >
      <div className="space-y-3">
        <CheckoutWidget
          amount={amount}
          description={description}
          showAmountForm={false}
          defaultToken="USDC"
          returnUrl={returnUrl}
          cancelUrl={cancelUrl}
          metadata={metadata}
          onSuccess={onSuccess}
          onError={(err) => setError(err)}
          style={{ maxWidth: 480, width: "100%" }}
        />
        {pending && (
          <p className="text-xs text-zinc-500">Saving payment…</p>
        )}
        {done && !error && (
          <p className="text-xs text-emerald-700">Payment created — redirecting…</p>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </PayDirectProvider>
  );
}
