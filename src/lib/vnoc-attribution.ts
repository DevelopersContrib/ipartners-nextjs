/**
 * Minimal VNOC attribution helpers for support tickets.
 * iPartner partnership ingest uses other VNOC endpoints; these postbacks
 * are optional and skip cleanly when tokens are unset.
 */

export type VnocResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

async function postSupportEvent(
  eventType: "support_case" | "support_resolved",
  ticketRef: string
): Promise<VnocResult> {
  try {
    const baseUrl = process.env.VNOC_ATTRIBUTION_URL?.trim();
    const domainId = process.env.VNOC_DOMAIN_ID?.trim();
    const productId = process.env.VNOC_IPARTNER_PRODUCT_ID?.trim();
    const token = process.env.VNOC_IPARTNER_ATTRIBUTION_TOKEN?.trim();
    if (!baseUrl || !domainId || !productId || !token) {
      return { ok: false, skipped: true };
    }

    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/vnoc-products/attribution`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: Number(productId),
        domain_id: Number(domainId),
        event_type: eventType,
        ref_external_id: ticketRef,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`[vnoc-attribution] ${eventType} failed`, res.status, err.slice(0, 200));
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[vnoc-attribution] error", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export function postVnocSupportCase(ticketRef: string): Promise<VnocResult> {
  return postSupportEvent("support_case", ticketRef);
}

export function postVnocSupportResolved(ticketRef: string): Promise<VnocResult> {
  return postSupportEvent("support_resolved", ticketRef);
}
