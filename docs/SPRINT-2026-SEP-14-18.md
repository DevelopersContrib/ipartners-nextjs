# Sprint Sep 14–18 — Joseph + Jayson

**Dates:** Monday, September 14 – Friday, September 18, 2026  
**Development:** Joseph  
**UI:** Jayson  
**Repository:** `DevelopersContrib/ipartners-nextjs`  
**Tracking:** This file is the only sprint source of truth. Do not create a GitHub milestone or a second sprint doc for this week.

**Follows:** [`SPRINT-2026-SEP-7-11.md`](./SPRINT-2026-SEP-7-11.md) (all seven stories merged; residual gaps below).

---

## Goal

Prove the GA4 funnel in DebugView, ship **approved** marketing proof (not
process-only), rewrite and safely re-enable iPartner drip, and close leftover
conversion / nav polish on domain + portal surfaces.

Success means:

1. All four GA4 funnel events verified once in DebugView on a happy path (no PII).
2. Homepage shows at least one approved logo **or** quote **or** metric — or stays process-only with written “still pending” note from product.
3. iPartner drip templates use `/portal` paths; `ENGAGEMENT_DRIP_ENABLED` can be turned on without Referrals CTAs.
4. Portal matches link to public `/d/{domain}`; support ticket create no longer routes to `/dashboard/support`.
5. `tsc`, lint, build, and the smoke checklist pass.

---

## Who owns what

| # | Story | Owner | Points | Priority |
| --- | --- | --- | ---: | --- |
| 1 | GA4 DebugView verification + double-fire fixes | Joseph | 3 | P0 |
| 2 | Approved marketing proof assets (logos / quotes / metrics) | Jayson | 5 | P0 |
| 3 | Rewrite iPartner drip + enable gate | Joseph | 5 | P0 |
| 4 | Portal matches → `/d/{domain}` + support path fix | Joseph | 2 | P1 |
| 5 | Per-domain OG image + sample-report visual polish | Jayson | 3 | P1 |
| 6 | GA4-only Analytics (strip Matomo) + `needs_info` queue badge | Joseph | 2 | P2 |
| 7 | Funnel a11y QA + optional `/d` mini-apply | Jayson | 3 | P2 |

**Total:** Joseph 12 · Jayson 11

---

## Already shipped (Sep 7–11) — do not redo

Verified on production 2026-09-13:

| Area | Status | Notes |
| --- | --- | --- |
| GA4 event helper + wire-up | Code live | `marketing-analytics.ts`; GA id `G-801W4DGBNR` loads — DebugView not yet proven |
| Marketing proof fallback | Live | “How sponsorship works”; Jordan P. removed; arrays empty |
| Sample Silver report | Live | `/sponsorship/sample-report` |
| Stale checkout / support copy | Live | Invoice → checkout; `hello@ipartner.com` |
| Drip disabled | Live | `isDripEnabled()` default off; templates still Referrals |
| Root OG image | Live | `/opengraph-image` |
| Sitemap `/d/*` | Live | 1000 domain URLs |
| Domain CTA + portal shells | Live | Sticky apply; no “Coming soon” cards |
| `needs_info` send | Live | ReviewCard send/skip → `ipp_campaign_send` |

---

## Story 1 — GA4 DebugView verification

**Owner:** Joseph · **P0** · **3 points**

### Do

1. Run happy path in a browser with GA4 DebugView open:
   - `/match` → complete quiz → `match_complete`
   - `/apply` submit success → `apply_submit`
   - `/checkout/sponsor?tier=bronze&vertical=ai` widget mount → `checkout_start`
   - Successful `/api/checkout/sponsor/record` → `payment_recorded`
2. Confirm no PII (no email, name, payment id).
3. Confirm remount / Strict Mode does not double-fire `checkout_start` (use a `useRef` guard if needed).
4. Confirm failed apply / failed record do **not** emit success events.
5. Document results in a private release note (no secrets).

### Files

| File | Role |
| --- | --- |
| `src/lib/marketing-analytics.ts` | Emitter — only touch if bugs found |
| `src/components/MatchQuiz.tsx` | `match_complete` |
| `src/components/ApplicationForm.tsx` | `apply_submit` |
| `src/components/paydirect/SponsorCheckoutWidget.tsx` | `checkout_start` / `payment_recorded` |
| `src/components/Analytics.tsx` | Must load `NEXT_PUBLIC_GA_ID` |

### Acceptance

- [ ] All four events appear once in GA4 DebugView on happy path.
- [ ] No double-fire on checkout remount.
- [ ] Failed paths emit nothing.
- [ ] No email / payment id in event params.

---

## Story 2 — Approved marketing proof assets

**Owner:** Jayson · **P0** · **5 points**

### Content rule

No fabricated logo, quote, traffic number, conversion rate, or ROI. Every public
entry in `PROOF_LOGOS` / `PROOF_QUOTES` / `PROOF_METRICS` must have
`status: "approved"` and a written `approvalNote`.

### Do

1. Collect written approvals (email / Slack / brand kit) for logos, quotes, metrics.
2. Add assets under `public/proof/` (or approved CDN URLs).
3. Fill `src/content/marketing-proof.ts` — only `approved` rows render via `MarketingProof.tsx`.
4. Keep “How sponsorship works” as fallback when arrays are empty.
5. If approvals miss **Tue Sep 15 noon**: leave arrays empty; note blocker in this doc; do not invent placeholders.

### Files

| File | Role |
| --- | --- |
| `src/content/marketing-proof.ts` | Typed proof + approval notes |
| `src/components/MarketingProof.tsx` | Homepage section (already mounts) |
| `public/proof/*` | Approved image assets |

No DB. Do not write proof into `ipp_*` or `MarketPartnership`.

### Acceptance

- [ ] At least one approved logo **or** quote **or** metric live on homepage — **or** product-signed deferral.
- [ ] Every `approved` row has `approvalNote`.
- [ ] No CLS from missing logos; empty slots omitted.
- [ ] Jordan P. still absent.
- [ ] Sponsor CTAs still reach checkout / apply / sample report.

---

## Story 3 — Rewrite iPartner drip + enable gate

**Owner:** Joseph · **P0** · **5 points**

### Context

`isDripEnabled()` gates enrollment/send (default off). Templates in
`engagement-email-templates.ts` still use Referrals logo and
`/dashboard` `/brands` `/stats`.

### Do

1. Rewrite `FEATURE_TOUR` (or replace with an iPartner-specific series) to use:
   - Logo: iPartner CDN logo (same as portal header)
   - CTAs: `/portal`, `/portal/deals`, `/portal/discover`, `/portal/placements`, `/portal/help`
   - Copy: partnership / sponsorship language — not Referrals brand-manager tour
2. Keep token contract: `{{firstname}}`, `{{siteName}}`, `{{siteUrl}}`.
3. Gate remains `ENGAGEMENT_DRIP_ENABLED` — set to `true` in Vercel **only after** copy review.
4. Touch only `domain_key = 'ipartner'` drip rows if seeding/updating steps.

### Tables

| Table | Use |
| --- | --- |
| `ipp_drip_segments` | Read/write only `domain_key = 'ipartner'` |
| `ipp_drip_campaigns` | Same |
| `ipp_drip_steps` | Upsert rewritten step HTML/subjects |
| `ipp_drip_enrollments` | Enrollment only when gate on |
| `ipp_drip_sends` | Send log when gate on |

### Functions / files

| Function / file | Role |
| --- | --- |
| `isDripEnabled()` | Keep fail-closed default |
| `FEATURE_TOUR` / `buildBrandedEngagementEmail()` | Rewrite brand + CTAs |
| `engagement-crud.ts` | Ensure enrollment paths respect gate |
| Admin Emails & AI screens | Smoke that drafts show iPartner paths |

### Acceptance

- [ ] No Referrals logo or `/dashboard` `/brands` `/stats` in enabled iPartner drip.
- [ ] With gate `false`, no new enrollments/sends.
- [ ] With gate `true` on preview, one test enrollment uses portal CTAs.
- [ ] Other domain keys untouched.

---

## Story 4 — Portal matches → `/d/{domain}` + support path fix

**Owner:** Joseph · **P1** · **2 points**

### Do

1. `src/app/portal/page.tsx` — match cards currently link
   `/portal/opportunities/{domain}`. Prefer public
   `domainPageHref(domain)` → `/d/{domain}` (partner can still open portal
   detail from Discover “View” if desired — or dual-link).
2. `src/components/support/NewSupportTicketForm.tsx` — replace
   `router.push(\`/dashboard/support/${…}\`)` with the real iPartner support
   destination (portal help / ticket detail / admin support as appropriate).
3. Grep for other `/dashboard` leftovers in partner-facing UI; fix or document as out of scope.

### Acceptance

- [ ] Portal home match card opens `/d/{domain}` (or clearly labeled dual CTA).
- [ ] Creating a support ticket does not 404 on `/dashboard/support/…`.
- [ ] No new DB tables.

---

## Story 5 — Per-domain OG + sample-report polish

**Owner:** Jayson · **P1** · **3 points**

### Do

1. Add Open Graph image for `/d/[domain]` (Next.js file convention under
   `src/app/d/[domain]/` or dynamic `ImageResponse` with domain name + PartnerScore).
2. Wire `generateMetadata` on the domain page to that image; prefer
   `https://www.ipartner.com` or existing `metadataBase`.
3. Visual polish pass on `/sponsorship/sample-report` — mobile + desktop;
   keep “sample / example” labeling obvious.
4. Spot-check share preview for one live domain (e.g. dogstream.com).

### Files

| File | Role |
| --- | --- |
| `src/app/d/[domain]/page.tsx` | Metadata |
| `src/app/d/[domain]/opengraph-image.tsx` (new) or shared helper | Domain OG |
| `src/lib/og-brand-image.ts` | Reuse brand tokens if possible |
| `src/app/sponsorship/sample-report/page.tsx` | Layout polish |

No DB.

### Acceptance

- [ ] Domain share preview shows domain name (not generic homepage-only card).
- [ ] Sample report readable at 320 / 768 / desktop; clearly sample data.
- [ ] OG debugger fetches without auth.

---

## Story 6 — GA4-only Analytics + `needs_info` queue badge

**Owner:** Joseph · **P2** · **2 points**

### Do

1. Remove Matomo bootstrap from `src/components/Analytics.tsx` (and any Matomo env docs in sprint-facing comments). Keep GA4 + existing VNOC tracker in layout.
2. On `/admin` queue rows: if latest `needs_info` campaign was already sent
   (`ipp_campaign_send` for that engagement + `needs_info`), show a small badge
   (“Asked”) so ops don’t re-send blindly.
3. Reuse existing unique key / `force` behavior on `sendNeedsInfoEmail` — do not invent a new table.

### Tables

| Table | Use |
| --- | --- |
| `ipp_campaign_send` | Read whether `needs_info` already sent |
| `ipp_engagement` | Queue row identity only |

### Acceptance

- [ ] No Matomo script tags when Matomo env vars are accidentally set.
- [ ] Queue shows sent state for needs-info where applicable.
- [ ] Partner agent thread still excludes `role=reviewer`.

---

## Story 7 — Funnel a11y QA + optional `/d` mini-apply

**Owner:** Jayson · **P2** · **3 points**

### Do

1. Keyboard + contrast + `prefers-reduced-motion` pass on:
   homepage, `/match`, `/apply`, `/portal/placements`, `/checkout/sponsor`,
   `/d/[domain]`, `/sponsorship/sample-report`.
2. Stretch: compact apply strip on public `/d/[domain]` (name, email, short message)
   posting to existing `POST /api/apply` with `domain` prefilled — **or** keep
   deep-link to `/apply?domain=` if time is short (document choice).

### Acceptance

- [ ] Focus rings visible; no critical contrast fails on primary CTAs.
- [ ] Reduced-motion does not break layout.
- [ ] If mini-apply ships: creates `ipp_engagement` + VNOC ingest like full apply; no duplicate APIs.

---

## Database safety (all stories)

Shared production `contrib_rdb`:

1. Never `prisma db push` / `prisma migrate *`.
2. `MarketPartnership` and `domaindi_managedomain.*` are read-only.
3. Own tables are `ipp_*` only.
4. Drip writes only for `domain_key = 'ipartner'`.
5. No schema change planned. If required: amend this doc first → additive SQL →

```bash
pnpm run db:check prisma/migrations/<file>.sql
pnpm run db:apply prisma/migrations/<file>.sql
pnpm exec prisma generate
```

---

## Blockers

**Proof (Jayson):**

- [ ] Written approvals for logos / quotes / metrics.
- [ ] Asset files or CDN URLs.

**Drip enable (Joseph):**

- [ ] Product sign-off on rewritten email copy.
- [ ] Vercel `ENGAGEMENT_DRIP_ENABLED=true` only after preview test.

**GA4 (Joseph):**

- [ ] Access to GA4 property DebugView for `G-801W4DGBNR` (or current `NEXT_PUBLIC_GA_ID`).

---

## Daily plan

### Mon Sep 14

- Joseph: GA4 DebugView happy path; note gaps.
- Jayson: chase proof approvals; inventory assets.

### Tue Sep 15

- Joseph: start drip rewrite (logo + CTA paths).
- Jayson: land approved proof rows **or** written deferral by noon.
- **Proof cutoff: noon.**

### Wed Sep 16

- Joseph: finish drip rewrite; preview enrollment with gate on.
- Jayson: domain OG image + sample-report polish.

### Thu Sep 17

- Joseph: portal `/d` links + support path fix; start Matomo strip / queue badge.
- Jayson: funnel a11y pass; decide mini-apply vs deep-link.

### Fri Sep 18

- Joseph: enable drip in prod only if accepted; quality gate.
- Jayson: visual sign-off mobile + desktop.
- Shared: smoke checklist + private release note (no secrets).

---

## Quality gate

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm run build
```

### Smoke

1. GA4 DebugView: four events on match → apply → checkout → record.
2. Homepage: approved proof **or** process fallback; no Jordan P.
3. `/sponsorship/sample-report` mobile + desktop.
4. Drip preview: iPartner CTAs only; gate off = no send.
5. Portal home match → `/d/{domain}`.
6. Support ticket create does not hit `/dashboard/support`.
7. `/d/dogstream.com` OG / apply path.
8. `/admin` needs-info send still works; badge if Story 6 done.

---

## Definition of done

- [ ] Every committed P0 criterion passes.
- [ ] No new DB table unless this doc was amended first.
- [ ] No write to `MarketPartnership` or managedomain.
- [ ] Drip enable requires product copy sign-off.
- [ ] No secret in git or this doc.
- [ ] Build, typecheck, lint, and smoke pass.
- [ ] Jayson signs off UI mobile + desktop.
- [ ] Joseph signs off GA4 verification + drip gate behavior.
- [ ] Product owner approves public proof before treating Story 2 complete.

---

## Out of scope this sprint

- AI email-management redesign beyond drip rewrite.
- AI live support / support inbox rebuild.
- Public sponsor directory / CMS.
- Live slot inventory booking.
- Sponsor renewal / upgrade automation.
- Full legacy-page brand rewrite.
- First-party marketing event database.
- Local VNOC domain sync table.
- Any migration or write to legacy tables.
