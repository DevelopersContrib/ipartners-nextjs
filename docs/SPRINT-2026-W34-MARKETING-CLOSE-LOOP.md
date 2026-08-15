# Sprint 2026-W34 — Marketing close loop

**Dates:** Monday, August 17 – Friday, August 21, 2026  
**Development owner:** Julius (`juliusL03`)  
**UI owner:** Andre (`andrebc52`)  
**Repository:** `DevelopersContrib/ipartners-nextjs`  
**Tracking:** This document is the sprint source of truth. Do not create a GitHub milestone for it.

## Sprint goal

Make the existing sponsor funnel safe to release, measurable from match through
payment, and credible enough to put in front of prospects.

The sprint is successful when:

1. PayDirect works in test mode from checkout creation through a signed
   `payment.confirmed` or `payment.forwarded` webhook.
2. The settled payment is linked to one approved sponsor engagement without
   duplicate rows or duplicate lifecycle email.
3. GA4 and Matomo receive the four agreed funnel events without email, name,
   payment id, or other personally identifiable information.
4. The homepage has approved, verifiable proof content and a useful sample
   sponsor report; no testimonial or metric is fabricated.
5. Production build, typecheck, lint, and the manual smoke checklist pass.

## Capacity and ownership

| Owner | Committed work | Estimate |
| --- | --- | ---: |
| Julius | PayDirect hardening and end-to-end verification | 5 points |
| Julius | Funnel event helper and four integrations | 5 points |
| Andre | Proof system, homepage proof section, sample Silver report | 5 points |
| Andre | Root social image and responsive visual QA | 3 points |
| Julius | Stale sponsor invoice wording / drip safety check | 2 points (stretch) |

Do not add unrelated portal, support inbox, AI email management, or AI live
support work to this sprint.

---

## Story 1 — PayDirect production hardening

**Owner:** Julius  
**Priority:** P0  
**Estimate:** 5 points

### Existing code to use

| Purpose | Existing code |
| --- | --- |
| Checkout UI | `src/components/paydirect/SponsorCheckoutWidget.tsx` |
| Checkout page | `src/app/checkout/sponsor/page.tsx` |
| Client record endpoint | `src/app/api/checkout/sponsor/record/route.ts` |
| PayDirect webhook | `src/app/api/webhooks/paydirect/route.ts` |
| Payment persistence | `recordPaydirectPayment()` in `src/lib/paydirect.ts` |
| Settlement fulfillment | `fulfillSponsorPayment()` in `src/lib/paydirect.ts` |
| Signature verification | `verifyPaydirectSignature()` in `src/lib/paydirect.ts` |
| Same-origin API proxy | `src/app/api/paydirect/[...path]/route.ts` |
| Partner identity | `getCurrentPartner()` in `src/lib/auth.ts` |
| Canonical prices | `sponsorTierAmount()` and `SPONSOR_TIER_PRICES_USD` in `src/lib/sponsor-pricing.ts` |
| Tier validation | `isSponsorTier()` in `src/lib/admin-client.ts` |
| Engagement creation/dedupe | `createEngagement()` in `src/lib/engagements.ts` |
| Approval lifecycle email | `notifyStatusChange()` in `src/lib/campaigns.ts` |
| Approved lead handoff | `pushEngagementToGrowagent()` in `src/lib/growagent.ts` |

### Already done (do not redo)

- Same-origin PayDirect proxy at `src/app/api/paydirect/[...path]/route.ts`.
  PayDirect answers CORS preflight with its own origin only, so the widget
  never calls `www.paydirect.com` from the browser. `PayDirectProvider`
  uses `baseUrl="/api/paydirect"` and an empty client `apiKey`; the proxy
  attaches `PAYDIRECT_API_KEY` server-side.
- Checkout record + proxy both pin amount from `sponsorTierAmount(tier)` and
  overwrite buyer email from the session.
- Domain-scoped sponsorships: `scope_type` / `scope_value` flow through
  placements configurator → checkout → record → `fulfillSponsorPayment`.
- **Do not** set `NEXT_PUBLIC_PAYDIRECT_API_KEY`. The key stays server-only.

### Required changes

1. **Make webhook verification fail closed outside local development.**
   - Today the route accepts unsigned webhooks when
     `PAYDIRECT_WEBHOOK_SECRET` is missing.
   - In production, return `503` when the secret is missing and `401` when the
     signature is invalid.
   - Continue to calculate the HMAC from the untouched raw request body.

2. **Keep settlement idempotent.**
   - Re-delivering the same webhook must update the same `ipp_payment` row via
     unique key `(provider, provider_payment_id)`.
   - It must reuse the same open sponsor engagement for
     `(email, mode=sponsor, scope)` through `createEngagement()` / current lookup
     (scope may be `vertical` or `domain`).
   - It must not resend `approved` mail after the engagement is already
     `approved` or `active`.

3. **Add an executable webhook fixture test.**
   - Suggested file: `scripts/test-paydirect-webhook.ts`.
   - Cover valid signature, invalid signature, duplicate delivery, `created`,
     `confirmed`, `forwarded`, and `failed`.
   - The test must not call `prisma db push` or any Prisma migration command.

4. **Production configuration (operator action, not committed).**
   - Set **server-only** `PAYDIRECT_API_KEY` (never `NEXT_PUBLIC_…`).
   - Set `PAYDIRECT_WEBHOOK_SECRET`.
   - Configure the PayDirect workspace settlement address.
   - Register:
     `https://ipartner.com/api/webhooks/paydirect`
   - Subscribe to:
     `payment.created`, `payment.confirmed`, `payment.forwarded`,
     `payment.failed`, and `payment.expired` if PayDirect supports it.

### Database tables

#### Write: `ipp_payment` (`IppPayment`)

Use for every PayDirect payment state. Important columns:

- `id`
- `engagement_id`
- `email`
- `provider` (`paydirect`)
- `provider_payment_id`
- `status` (`created|confirmed|forwarded|failed|expired`)
- `tier` (`bronze|silver|gold`)
- `vertical`
- `amount`
- `currency`
- `payment_method`
- `metadata_json`
- `created_at`, `updated_at`

The existing unique key `uq_provider_payment(provider, provider_payment_id)`
provides payment idempotency. Do not add another payment table.

#### Write: `ipp_engagement` (`IppEngagement`)

Only `fulfillSponsorPayment()` writes the paid sponsor outcome:

- `mode = 'sponsor'`
- `scope_type = 'vertical' | 'domain'` (from payment `metadata_json`)
- `scope_value = <vertical slug | domain>`
- `tier = bronze|silver|gold`
- `status = 'approved'` after signed `confirmed` or `forwarded`

Do not create sponsor history from legacy rows. Do not backfill sponsor mode.

#### Write through existing mail helper: `ipp_campaign_send`

`notifyStatusChange()` / `sendEngagementCampaign()` records one row per
`(engagement_id, campaign_key)`. Preserve the unique key
`uq_engagement_campaign`; it prevents duplicate lifecycle sends.

#### Read only

- `ipp_partners`: local partner name/profile lookup.
- `Members`: identity lookup by `EmailAddress`.
- `MarketPartnership`: not required for checkout; if inspected, read only.

### PayDirect acceptance criteria

- [ ] Missing production webhook secret does not accept a webhook.
- [ ] Invalid signature returns `401` and writes no row.
- [ ] Browser cannot choose a lower amount or a settled status.
- [ ] `payment.created` creates or updates one `ipp_payment` row only.
- [ ] Signed `payment.confirmed` or `payment.forwarded` links one approved
      sponsor `ipp_engagement`.
- [ ] Duplicate webhook delivery does not duplicate payment, engagement, email,
      or Growagent approval handoff.
- [ ] `payment.failed` / `payment.expired` never approves an engagement.
- [ ] Success page accurately says settlement is pending until webhook
      confirmation.

### Verification queries

Run only focused reads against the known test payment:

```sql
SELECT id, provider_payment_id, status, tier, vertical, amount, currency,
       payment_method, engagement_id, created_at, updated_at
FROM ipp_payment
WHERE provider = 'paydirect' AND provider_payment_id = ?;

SELECT id, mode, scope_type, scope_value, status, tier, created_at, updated_at
FROM ipp_engagement
WHERE id = ?;

SELECT engagement_id, campaign_key, send_status, provider_id, created_at
FROM ipp_campaign_send
WHERE engagement_id = ? AND campaign_key = 'approved';
```

Do not paste customer email or webhook secrets into sprint notes or screenshots.

---

## Story 2 — Funnel conversion events

**Owner:** Julius  
**Priority:** P0  
**Estimate:** 5 points

### Implementation

Create a client-safe helper:

`src/lib/marketing-analytics.ts`

Suggested public API:

```ts
export type MarketingEventName =
  | "match_complete"
  | "apply_submit"
  | "checkout_start"
  | "payment_recorded";

export function trackMarketingEvent(
  name: MarketingEventName,
  params?: Record<string, string | number | boolean | undefined>,
): void;
```

The helper should:

- call GA4 through `window.gtag("event", name, cleanParams)` when available;
- call Matomo through
  `window._paq.push(["trackEvent", "Marketing Funnel", name, label, value])`;
- silently no-op when either provider is not configured;
- remove `undefined` values;
- never accept or send email, first/last name, free-text application answers,
  payment id, or webhook payload.

Do not create a database table for these events this sprint. GA4 and Matomo are
the event stores. Confirmed revenue remains queryable from `ipp_payment`.

### Event locations and properties

| Event | Trigger/file | Allowed properties |
| --- | --- | --- |
| `match_complete` | After `matchPartner()` succeeds in `src/components/MatchQuiz.tsx` | `mode`, `primary_vertical`, `vertical_count`, `commitment` |
| `apply_submit` | After a successful `/api/apply` response in `src/components/ApplicationForm.tsx` | `mode`, `vertical`, `tier`, `partnership_type`, `has_referral` |
| `checkout_start` | Once per mounted checkout widget in `src/components/paydirect/SponsorCheckoutWidget.tsx` | `tier`, `vertical`, `amount`, `currency: USD` |
| `payment_recorded` | After `/api/checkout/sponsor/record` returns `2xx` | `tier`, `vertical`, `payment_method`, `status` |

`checkout_start` must fire once per page load, not on every React render.

Do not send `payment_confirmed` from the browser. The authoritative conversion is
the signed webhook and `ipp_payment.status`. A later server-side analytics export
can be designed separately.

### Existing analytics code

- `src/components/Analytics.tsx` initializes GA4 and Matomo.
- `src/app/layout.tsx` loads VNOC `tracker.js`; do not guess undocumented VNOC
  event APIs in this sprint.

### Analytics acceptance criteria

- [ ] All four events appear once in GA4 DebugView for one happy-path session.
- [ ] All four events appear in Matomo's event report.
- [ ] Retaking the match produces a new `match_complete`; React rerenders do not.
- [ ] Failed application and failed local payment record do not emit success
      events.
- [ ] Network requests contain no PII or payment id.
- [ ] Analytics-disabled local development remains error-free.

---

## Story 3 — Verifiable marketing proof

**Owner:** Andre  
**Priority:** P0  
**Estimate:** 5 points

### Content rule

No fabricated customer, logo, quote, traffic number, conversion rate, or ROI.
If approved proof is not supplied by Tuesday noon, replace the current soft
testimonial with a factual “How sponsorship works” section and ship the proof
slots only after approval.

### Proof implementation

Use static, reviewed content this sprint; no database is required.

Suggested files:

- `src/content/marketing-proof.ts`
  - typed approved logos, quotes, and outcome metrics;
  - include source/approval notes in code comments, not public output.
- `src/components/MarketingProof.tsx`
  - replaces or supersedes `src/components/FeaturedReview.tsx`;
  - supports zero fabricated placeholders.
- `src/app/sponsorship/sample-report/page.tsx`
  - a public sample of the Silver monthly report;
  - clearly label example/sample data;
  - include impressions, clicks, click-through rate, top queries, and placement
    list definitions so buyers know what they receive.

Update:

- `src/app/page.tsx` to render the approved proof component;
- `src/components/SponsorshipPricing.tsx` to link “monthly report” to the sample;
- relevant vertical page CTA only if it helps the same funnel.

### Proof database use

None. Do not put marketing copy into:

- `ipp_engagement.application_json`;
- `ipp_payment.metadata_json`;
- `ipp_drip_*`;
- `MarketPartnership`.

If a CMS is approved later, design that separately. Static content is faster,
reviewable, and safer for this sprint.

### Proof acceptance criteria

- [ ] Every public logo/quote/metric has written approval.
- [ ] Current “Jordan P.” content is either verified or removed.
- [ ] Sponsor proof is readable at 320px, 768px, and desktop widths.
- [ ] Sample report distinguishes example data from actual customer outcomes.
- [ ] Sponsor CTA remains visible and routes to the existing checkout/apply flow.
- [ ] No layout shift from missing or incorrectly sized logos.

---

## Story 4 — Social image and visual QA

**Owner:** Andre  
**Priority:** P1  
**Estimate:** 3 points

### Social image implementation

- Add a root Open Graph image using the Next.js 16 file convention after reading
  the installed guide under `node_modules/next/dist/docs/`.
- Update root metadata in `src/app/layout.tsx` so Open Graph and Twitter use the
  image.
- Use the current warm marketplace brand (`--ipp-*`, Poppins/Comfortaa), not the
  older dark-green visual system.
- Test homepage, match, apply, sponsor checkout, sample report, and checkout
  success at mobile and desktop widths.

### Social image database use

None.

### Social image acceptance criteria

- [ ] Social preview has logo/name, sponsorship proposition, safe cropping, and
      no tiny body copy.
- [ ] Open Graph debugger can fetch the production image without authentication.
- [ ] Marketing and checkout pages use one visual system.
- [ ] Keyboard focus, contrast, and reduced-motion behavior remain usable.

---

## Stretch — Remove stale sponsor/email wording

**Owner:** Julius  
**Priority:** P2  
**Estimate:** 2 points

This is copy correctness, not the AI email-management project.

1. Update `sponsor_invoice` in `src/lib/campaigns.ts`; it currently says
   self-serve checkout is “coming soon.”
2. Audit `src/lib/engagement-email-templates.ts`.
   - It currently contains a Referrals-branded feature tour and `/dashboard`,
     `/brands`, and `/stats` CTAs.
   - Do not enroll iPartner users into this sequence until it is rewritten for
     `/portal`, `/portal/deals`, `/portal/discover`, and `/portal/placements`.
3. If a full rewrite cannot fit, disable the stale iPartner drip rather than
   sending incorrect product instructions.

### Email database use

Only use the existing mapped tables if the rewritten campaign is enabled:

- `ipp_drip_segments`
- `ipp_drip_campaigns`
- `ipp_drip_steps`
- `ipp_drip_enrollments`
- `ipp_drip_sends`

All rows must retain `domain_key = 'ipartner'`. Do not delete or overwrite rows
belonging to another domain key.

---

## Database safety rules

The database is shared production `contrib_rdb`.

1. Never run:
   - `prisma db push`
   - `prisma migrate dev`
   - `prisma migrate deploy`
2. `MarketPartnership` is read-only in this app. It powers a public widget on
   roughly 30,000 domains.
3. All owned tables start with `ipp_`.
4. No schema change is planned for this sprint.
5. If an unexpected schema need is discovered:
   - stop and update this sprint doc first;
   - write additive `ipp_*` SQL under `prisma/migrations/`;
   - run:

```bash
pnpm run db:check prisma/migrations/<file>.sql
pnpm run db:apply prisma/migrations/<file>.sql
pnpm exec prisma generate
```

Do not repurpose a legacy table to avoid this process.

## Environment and external blockers

Required before PayDirect QA:

- [ ] PayDirect test API key (do not use a $500 live charge as a smoke test).
- [ ] PayDirect webhook signing secret.
- [ ] PayDirect settlement address.
- [ ] Access to register/resend PayDirect webhook deliveries.
- [ ] Production/Vercel env access.
- [ ] `NEXT_PUBLIC_GA_ID`.
- [ ] `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID`.

Required before proof UI:

- [ ] Approved company/customer logos.
- [ ] Approved names/titles and quotes.
- [ ] Source for any outcome metric.
- [ ] Decision on whether the current Jordan P. quote is verified.

If proof approval is not available, Andre ships factual process/sample-report UI
only; placeholders must not go public.

## Daily sequence

### Monday, Aug 17

- Julius: add security tests and harden client record/webhook authority.
- Andre: obtain approved proof assets and prepare proof/sample-report layout.
- Shared: confirm PayDirect test credentials, webhook secret, settlement address,
  GA4, and Matomo access.

### Tuesday, Aug 18

- Julius: complete idempotent test-mode checkout and webhook fixture.
- Andre: implement typed proof content and homepage section.
- Proof content approval cutoff: noon.

### Wednesday, Aug 19

- Julius: implement analytics helper and match/apply events.
- Andre: implement sample Silver report and pricing link.

### Thursday, Aug 20

- Julius: checkout/payment analytics; PayDirect integration smoke.
- Andre: Open Graph image and cross-device/accessibility QA.
- Shared: integration review; verify no PII in analytics.

### Friday, Aug 21

- Run full quality gate.
- Deploy to preview and repeat signed webhook test.
- Deploy production only after P0 acceptance criteria pass.
- Record test payment/engagement/campaign row ids in a private release note
  (never secrets or full customer data).

## Quality gate

Run from the repository root:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm run build
```

If a DB migration is unexpectedly approved, also run its `db:check` before
`db:apply`.

Manual smoke:

1. `/match` → complete quiz → apply with match.
2. `/apply?mode=sponsor&tier=bronze&vertical=<valid-slug>` → successful submit.
3. Signed-in `/checkout/sponsor?tier=bronze&vertical=<valid-slug>`.
4. PayDirect test checkout → local payment record.
5. Signed `payment.confirmed` webhook → approved sponsor engagement.
6. `/portal/deals` shows the engagement.
7. Homepage proof and `/sponsorship/sample-report` at mobile and desktop widths.
8. GA4 DebugView and Matomo show expected, non-PII events.

## Definition of done

- [ ] Every committed P0 acceptance criterion passes.
- [ ] No new DB table was added unless this document was amended and approved.
- [ ] No write was made to `MarketPartnership`.
- [ ] No sponsor rows were created from historical backfill.
- [ ] No production secret is committed or copied into documentation.
- [ ] Build, typecheck, lint, preview smoke, and signed webhook test pass.
- [ ] Andre signs off UI at mobile and desktop sizes.
- [ ] Julius signs off payment state and DB idempotency.
- [ ] Product owner approves all public proof before production deployment.

## Explicitly out of scope

- AI email-management redesign.
- AI live support.
- Public sponsor directory/CMS.
- Live slot-level inventory booking.
- Sponsor renewal/upgrade automation.
- Brand rewrite of every legacy page.
- First-party marketing event database.
- Any migration or write to legacy tables.
