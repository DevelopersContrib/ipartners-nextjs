# Sprint Aug 18–22 — Julius + Andre

**Dates:** Tuesday, August 18 – Saturday, August 22, 2026  
**Development:** Julius (`juliusL03`)  
**UI:** Andre (`andrebc52`)  
**Repository:** `DevelopersContrib/ipartners-nextjs`  
**Tracking:** This file is the only sprint source of truth. Do not create a GitHub milestone or a second sprint doc.

---

## Goal

Finish measurement, honest marketing proof, and product-copy cleanup around the
now-live sponsor funnel. PayDirect hardening and admin AI pre-screen are already
complete; Julius starts with analytics and the remaining ops gaps.

Success means:

1. GA4 + Matomo receive four funnel events with no PII.
2. Homepage proof and a sample Silver report are approved and real (or factual process UI if proof is late).
3. No user-facing “checkout coming soon” / Referrals-branded drip / wrong support email.
4. `tsc`, lint, build, and the smoke checklist pass.

---

## Who owns what

| # | Story | Owner | Points | Priority |
| --- | --- | --- | ---: | --- |
| 1 | Funnel conversion events (GA4 + Matomo) | Julius | 5 | P0 |
| 2 | Verifiable marketing proof + sample Silver report | Andre | 5 | P0 |
| 3 | Root social image + responsive visual QA | Andre | 3 | P1 |
| 4 | Kill stale checkout / drip / support copy | Julius | 3 | P1 |
| 5 | Admin AI pre-screen polish (`needs_info` draft) | Julius | 2 | P2 |

**Total:** Julius 10 · Andre 8

---

## Already shipped — do not redo

Ship notes from the week of Aug 11–15. Julius and Andre start from here.

| Area | What landed | Key files |
| --- | --- | --- |
| Mode-first apply | `/apply` starts with engagement mode; legacy landers retargeted | `ApplyPageClient.tsx`, `EngagementModePicker.tsx`, `PricingTiers.tsx` |
| Placements configurator | Category **or** single-domain scope + tier features → checkout | `PlacementConfigurator.tsx`, `/portal/placements`, `sponsor-pricing.ts` |
| PayDirect CORS proxy | Browser never calls PayDirect directly; key stays server-only | `src/app/api/paydirect/[...path]/route.ts`, `SponsorCheckoutWidget.tsx` |
| Amount / email authority | Record + proxy pin amount from tier and email from session | `record/route.ts`, paydirect proxy |
| Domain-scoped fulfill | `scope_type` / `scope_value` in metadata → engagement | `fulfillSponsorPayment()` |
| PayDirect hardening | Webhook fails closed; signed fixture suite; monotonic payment states; atomic approval side effects; canonical production webhook + Vercel secrets | `paydirect-webhook.ts`, `scripts/test-paydirect-webhook.ts`, webhook route |
| Admin AI pre-screen | Nightly + button: verdict + summary on every pending row; human still confirms | `engagement-review.ts`, `ReviewSweep.tsx`, `/api/cron/review-pending` |

**Env rule:** set `PAYDIRECT_API_KEY` only. Never `NEXT_PUBLIC_PAYDIRECT_API_KEY`.

---

## Story 1 — Funnel conversion events

**Owner:** Julius · **P0** · **5 points**

### Do

Create `src/lib/marketing-analytics.ts`:

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

- GA4: `window.gtag("event", name, cleanParams)` when present.
- Matomo: `window._paq.push(["trackEvent", "Marketing Funnel", name, label, value])`.
- No-op when analytics unset. Strip `undefined`. Never send email, name, answers, payment id, or webhook payload.
- **No new DB table.** Events live in GA4/Matomo. Revenue stays in `ipp_payment`.

| Event | Where | Allowed props |
| --- | --- | --- |
| `match_complete` | After success in `MatchQuiz.tsx` | `mode`, `primary_vertical`, `vertical_count`, `commitment` |
| `apply_submit` | After `/api/apply` `2xx` in `ApplicationForm.tsx` | `mode`, `vertical`, `tier`, `partnership_type`, `has_referral` |
| `checkout_start` | Once on widget mount in `SponsorCheckoutWidget.tsx` | `tier`, `vertical`, `amount`, `currency: USD` |
| `payment_recorded` | After record API `2xx` | `tier`, `vertical`, `payment_method`, `status` |

Do not fire `payment_confirmed` from the browser. Existing: `Analytics.tsx`. Do not invent VNOC tracker event APIs.

### Acceptance

- [ ] All four events once in GA4 DebugView on a happy path.
- [ ] Same four in Matomo.
- [ ] Rerenders do not double-fire; quiz retake does fire again.
- [ ] Failed apply / failed record do not emit success events.
- [ ] No PII or payment id on the wire.

---

## Story 2 — Verifiable marketing proof

**Owner:** Andre · **P0** · **5 points**

### Content rule

No fabricated logo, quote, traffic number, conversion rate, or ROI. If approved proof is not in by **Tuesday noon**, ship a factual “How sponsorship works” section and leave proof slots empty until approval.

### Do (static — no DB)

| File | Role |
| --- | --- |
| `src/content/marketing-proof.ts` | Typed logos / quotes / metrics + approval notes in comments |
| `src/components/MarketingProof.tsx` | Replaces or supersedes `FeaturedReview.tsx` |
| `src/app/sponsorship/sample-report/page.tsx` | Public sample Silver monthly report (label as sample) |
| `src/app/page.tsx` | Mount proof |
| `SponsorshipPricing.tsx` | “Monthly report” → sample page |

Do not store marketing copy in `ipp_engagement.application_json`, `ipp_payment.metadata_json`, drip tables, or `MarketPartnership`.

### Acceptance

- [ ] Every public logo/quote/metric has written approval.
- [ ] “Jordan P.” verified or removed.
- [ ] Readable at 320 / 768 / desktop.
- [ ] Sample report clearly marked example data.
- [ ] Sponsor CTA still reaches checkout / apply.
- [ ] No CLS from missing logos.

---

## Story 3 — Social image + visual QA

**Owner:** Andre · **P1** · **3 points**

### Do

1. Root Open Graph image via Next.js 16 file convention (`node_modules/next/dist/docs/`).
2. Wire `src/app/layout.tsx` Open Graph + Twitter to that image; set `metadataBase` to `https://ipartner.com`.
3. Brand: current warm marketplace (`--ipp-*`, Poppins/Comfortaa) — not the old dark-green shell.
4. Visual QA: homepage, match, apply, placements, checkout, sample report, success — mobile + desktop.

No DB.

### Acceptance

- [ ] Preview shows brand + sponsorship proposition; safe crop; no tiny body copy.
- [ ] OG debugger fetches the image without auth.
- [ ] One visual system across marketing + checkout.
- [ ] Keyboard focus, contrast, reduced-motion OK.

---

## Story 4 — Kill stale checkout / drip / support copy

**Owner:** Julius · **P1** · **3 points**

Copy correctness only — not the AI email-management project.

| Location | Fix |
| --- | --- |
| `src/lib/campaigns.ts` `sponsor_invoice` | Remove “checkout coming soon”; link live `sponsorCheckoutHref` / `/checkout/sponsor?…` |
| `SponsorInvoiceButton.tsx` | Remove “Checkout isn’t live yet” |
| `src/lib/admin-actions.ts` `sendSponsorInvoice` comment | Update comment; optionally include checkout URL in send |
| `src/app/admin/support/page.tsx` | Replace `support@referrals.com` with `hello@ipartner.com` (or configured support) |
| `src/lib/engagement-email-templates.ts` | Referrals logo + `/dashboard` `/brands` `/stats` — rewrite for `/portal`, `/portal/deals`, `/portal/discover`, `/portal/placements`, **or disable** the drip until rewritten |
| Fallback URLs | Prefer `NEXT_PUBLIC_BASE_URL` → `https://ipartner.com` over `ipartners.com` / Referrals defaults |

### Drip tables (only if rewritten campaign is enabled)

`ipp_drip_segments`, `ipp_drip_campaigns`, `ipp_drip_steps`, `ipp_drip_enrollments`, `ipp_drip_sends` — keep `domain_key = 'ipartner'`. Do not touch other domain keys.

### Acceptance

- [ ] No public “checkout coming soon” while PayDirect is live.
- [ ] No `support@referrals.com` in iPartner UI.
- [ ] No Referrals-branded drip CTAs sent to iPartner partners.
- [ ] Fallbacks use `ipartner.com`.

---

## Story 5 — Admin AI pre-screen polish

**Owner:** Julius · **P2** · **2 points**  
**UI assist (optional):** Andre if the queue/detail cards need clearer hierarchy.

### Already live

- `src/lib/engagement-review.ts` — AI + heuristics; persists `role=reviewer` on `ipp_agent_message`.
- `/admin` — ReviewSweep, verdict filters, Select AI-approve / AI-decline.
- `/admin/engagement/[id]` — ReviewCard + re-screen.
- Cron `/api/cron/review-pending` daily 05:00 UTC (`vercel.json`).
- Partner chat never sees `reviewer` rows.

### Do

Most pending rows come back `needs_info` because application answers are empty. Close that loop:

1. From a `needs_info` review, draft a short “what we still need” email body (reuse SES campaign helpers or a new `needs_info` campaign key — do not invent a new table).
2. Admin can send or skip; never auto-send without a click.
3. Persist send in `ipp_campaign_send` like other lifecycle mail.
4. Optional: queue badge when a `needs_info` nudge was already sent.

### Tables

| Table | Use |
| --- | --- |
| `ipp_agent_message` | Read latest `role=reviewer` meta (verdict / reason / flags). Do not migrate. |
| `ipp_engagement` | Read pending rows only for send target. |
| `ipp_campaign_send` | Write one row per `(engagement_id, campaign_key)`. |

### Acceptance

- [ ] Admin can send a drafted needs-info email from queue or detail.
- [ ] Duplicate send blocked by existing unique key unless `force`.
- [ ] Partner-facing agent thread still excludes `reviewer` role.
- [ ] No status auto-change from this story.

---

## Database safety (all stories)

Shared production `contrib_rdb`:

1. Never `prisma db push` / `prisma migrate *`.
2. `MarketPartnership` is read-only (~30k public widgets).
3. Own tables are `ipp_*` only.
4. No schema change planned. If one is required: amend this doc first → additive SQL under `prisma/migrations/` →

```bash
pnpm run db:check prisma/migrations/<file>.sql
pnpm run db:apply prisma/migrations/<file>.sql
pnpm exec prisma generate
```

---

## Blockers

**Analytics (Julius):**

- [ ] `NEXT_PUBLIC_GA_ID`.
- [ ] `NEXT_PUBLIC_MATOMO_URL` + `NEXT_PUBLIC_MATOMO_SITE_ID`.

**Proof (Andre):**

- [ ] Approved logos, names/titles, quotes, metric sources.
- [ ] Decision on Jordan P. quote.

If proof is late: factual process + sample-report UI only — no fake testimonials.

---

## Daily plan

### Tue Aug 18

- Julius: analytics helper + match/apply events.
- Andre: collect approved proof assets; sketch proof + sample-report layout.

### Wed Aug 19

- Julius: checkout/payment events + GA4/Matomo DebugView verification.
- Andre: typed proof content + homepage section.
- **Proof approval cutoff: noon.**

### Thu Aug 20

- Julius: stale checkout/drip/support copy pass.
- Andre: sample Silver report + pricing link.

### Fri Aug 21

- Julius: needs-info draft flow; finish analytics/copy acceptance.
- Andre: OG image + cross-device / a11y QA.
- Shared: no PII in analytics.

### Sat Aug 22

- Full quality gate + preview funnel smoke.
- Production only after P0 acceptance passes.
- Private release note with validation results only (no secrets).

---

## Quality gate

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm run build
```

### Smoke

1. `/match` → quiz → apply with match.
2. `/apply?mode=sponsor&tier=bronze&vertical=<slug>` → submit.
3. Signed-in `/portal/placements` → category or domain → checkout page.
4. Homepage proof + `/sponsorship/sample-report` mobile + desktop.
5. GA4 DebugView + Matomo show four non-PII events.
6. `/admin` — AI verdicts visible; Confirm AI-approve still requires reason + CONFIRM.

---

## Definition of done

- [ ] Every committed P0 criterion passes.
- [ ] No new DB table unless this doc was amended first.
- [ ] No write to `MarketPartnership`.
- [ ] No sponsor backfill from legacy rows.
- [ ] No secret in git or this doc.
- [ ] Build, typecheck, lint, and preview funnel smoke pass.
- [ ] Andre signs off UI mobile + desktop.
- [ ] Julius signs off analytics and stale-copy acceptance.
- [ ] Product owner approves public proof before production.

---

## Out of scope this sprint

- AI email-management redesign (beyond Story 4/5 copy + needs-info draft).
- AI live support / support inbox rebuild.
- Public sponsor directory / CMS.
- Live slot inventory booking.
- Sponsor renewal / upgrade automation.
- Full legacy-page brand rewrite.
- First-party marketing event database.
- Any migration or write to legacy tables.
