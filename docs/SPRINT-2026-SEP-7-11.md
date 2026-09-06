# Sprint Sep 7–11 — Joseph + Jayson

**Dates:** Monday, September 7 – Friday, September 11, 2026  
**Development:** Joseph  
**UI:** Jayson  
**Repository:** `DevelopersContrib/ipartners-nextjs`  
**Tracking:** This file is the only sprint source of truth. Do not create a GitHub milestone or a second sprint doc for this week.

**Supersedes:** [`SPRINT-2026-AUG-18-22.md`](./SPRINT-2026-AUG-18-22.md) (same unfinished stories, plus domain-page follow-ons shipped Aug 31).

---

## Goal

Close the measurement and trust gaps around the live sponsor funnel, clean
dangerous stale copy, and make public `/d/[domain]` pages discoverable and
conversion-ready.

Success means:

1. GA4 receives four funnel events with no PII.
2. Homepage proof is approved and real (or factual process UI if proof is late) + sample Silver report ships.
3. No user-facing “checkout coming soon” / Referrals-branded drip / wrong support email.
4. Top `/d/*` domains appear in the sitemap; domain pages pass visual QA.
5. `tsc`, lint, build, and the smoke checklist pass.

---

## Who owns what

| # | Story | Owner | Points | Priority |
| --- | --- | --- | ---: | --- |
| 1 | Funnel conversion events (GA4) | Joseph | 5 | P0 |
| 2 | Verifiable marketing proof + sample Silver report | Jayson | 5 | P0 |
| 3 | Kill stale checkout / drip / support copy | Joseph | 3 | P0 |
| 4 | Root social image + funnel visual QA | Jayson | 3 | P1 |
| 5 | Domain pages SEO + sitemap (`/d/*`) | Joseph | 2 | P1 |
| 6 | Domain page CTA polish + portal home shells | Jayson | 2 | P1 |
| 7 | Admin AI `needs_info` draft email | Joseph | 2 | P2 |

**Total:** Joseph 12 · Jayson 10

---

## Already shipped — do not redo

| Area | What landed | Key files |
| --- | --- | --- |
| Mode-first apply | `/apply` starts with engagement mode | `ApplyPageClient.tsx`, `EngagementModePicker.tsx` |
| Placements configurator | Category **or** single-domain scope → checkout | `PlacementConfigurator.tsx`, `sponsor-pricing.ts` |
| PayDirect live | CORS proxy, fail-closed webhook, fixture tests | `paydirect.ts`, `paydirect-webhook.ts`, `/api/paydirect/[...path]` |
| Admin AI pre-screen | Nightly + button; verdict on pending rows | `engagement-review.ts`, `ReviewSweep.tsx` |
| Public domain pages | `/d/[domain]` + PartnerScore + apply CTAs | `src/app/d/[domain]/page.tsx`, `DomainPartnershipView.tsx` |
| Live domain search | Full VNOC managedomain search (not top-brand shortlist) | `searchBrandsByQuery()`, `/api/domains/search` |

**Env rule:** set `PAYDIRECT_API_KEY` only. Never `NEXT_PUBLIC_PAYDIRECT_API_KEY`.

---

## Story 1 — Funnel conversion events

**Owner:** Joseph · **P0** · **5 points**

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

- GA4 only: `window.gtag("event", name, cleanParams)` when present.
- No-op when GA unset. Strip `undefined`. Never send email, name, answers, payment id, or webhook payload.
- **No new DB table.** Events live in GA4. Revenue stays in `ipp_payment`.

| Event | Where | Allowed props |
| --- | --- | --- |
| `match_complete` | After success in `MatchQuiz.tsx` | `mode`, `primary_vertical`, `vertical_count`, `commitment` |
| `apply_submit` | After `/api/apply` `2xx` in `ApplicationForm.tsx` | `mode`, `vertical`, `tier`, `partnership_type`, `has_referral` |
| `checkout_start` | Once on widget mount in `SponsorCheckoutWidget.tsx` | `tier`, `vertical`, `amount`, `currency: USD` |
| `payment_recorded` | After record API `2xx` | `tier`, `vertical`, `payment_method`, `status` |

Existing bootstrap: `src/components/Analytics.tsx`. Do not invent VNOC tracker event APIs. Do not fire `payment_confirmed` from the browser.

### Functions / files

| Function / file | Role |
| --- | --- |
| `trackMarketingEvent()` (new) | Client-safe GA4 emit |
| `MatchQuiz.tsx` | Fire `match_complete` |
| `ApplicationForm.tsx` | Fire `apply_submit` on success only |
| `SponsorCheckoutWidget.tsx` | Fire `checkout_start` once; `payment_recorded` after record |

### Acceptance

- [ ] All four events once in GA4 DebugView on a happy path.
- [ ] Rerenders do not double-fire; quiz retake does fire again.
- [ ] Failed apply / failed record do not emit success events.
- [ ] No PII or payment id on the wire.

---

## Story 2 — Verifiable marketing proof

**Owner:** Jayson · **P0** · **5 points**

### Content rule

No fabricated logo, quote, traffic number, conversion rate, or ROI. If approved
proof is not in by **Tuesday Sep 8 noon**, ship a factual “How sponsorship works”
section and leave proof slots empty until approval.

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

## Story 3 — Kill stale checkout / drip / support copy

**Owner:** Joseph · **P0** · **3 points**

Copy correctness only — not the AI email-management project.

| Location | Fix |
| --- | --- |
| `src/lib/campaigns.ts` `sponsor_invoice` | Remove “checkout coming soon”; link live `sponsorCheckoutHref` / `/checkout/sponsor?…` |
| `SponsorInvoiceButton.tsx` | Remove “Checkout isn’t live yet” |
| `src/lib/admin-actions.ts` `sendSponsorInvoice` | Update comment; optionally include checkout URL in send |
| `src/app/admin/support/page.tsx` | Replace `support@referrals.com` with `hello@ipartner.com` (or configured support) |
| `src/lib/engagement-email-templates.ts` | Referrals logo + `/dashboard` `/brands` `/stats` — rewrite for `/portal`, `/portal/deals`, `/portal/discover`, `/portal/placements`, **or disable** the drip until rewritten |
| Fallback URLs | Prefer `NEXT_PUBLIC_BASE_URL` → `https://ipartner.com` over `ipartners.com` / Referrals defaults (`email-unsubscribe.ts`, support notify helpers) |

### Tables (only if rewritten campaign is enabled)

| Table | Use |
| --- | --- |
| `ipp_drip_segments` | Read/write only for `domain_key = 'ipartner'` |
| `ipp_drip_campaigns` | Same |
| `ipp_drip_steps` | Same |
| `ipp_drip_enrollments` | Same |
| `ipp_drip_sends` | Same |

Do not touch other domain keys. Prefer **disable** over half-rewritten Referrals copy.

### Acceptance

- [ ] No public “checkout coming soon” while PayDirect is live.
- [ ] No `support@referrals.com` in iPartner UI.
- [ ] No Referrals-branded drip CTAs sent to iPartner partners.
- [ ] Fallbacks use `ipartner.com`.

---

## Story 4 — Root social image + funnel visual QA

**Owner:** Jayson · **P1** · **3 points**

### Do

1. Root Open Graph image via Next.js 16 file convention (`node_modules/next/dist/docs/`).
2. Wire `src/app/layout.tsx` Open Graph + Twitter to that image; set `metadataBase` to `https://ipartner.com`.
3. Brand: current warm marketplace (`--ipp-*`, Poppins/Comfortaa) — not the old dark-green shell.
4. Visual QA checklist (mobile + desktop): homepage, `/match`, `/apply`, `/portal/placements`, `/checkout/sponsor`, `/d/[domain]`, sample report, success.

No DB.

### Acceptance

- [ ] Preview shows brand + sponsorship proposition; safe crop; no tiny body copy.
- [ ] OG debugger fetches the image without auth.
- [ ] One visual system across marketing + checkout + domain pages.
- [ ] Keyboard focus, contrast, reduced-motion OK.

---

## Story 5 — Domain pages SEO + sitemap

**Owner:** Joseph · **P1** · **2 points**

### Context

`/d/[domain]` and `getBrandByDomain()` / `searchBrandsByQuery()` already ship.
`src/app/sitemap.ts` still only lists static routes + verticals — individual domains are never indexed.

### Do

1. Extend `sitemap.ts` to include a capped set of active domains (e.g. top N by PartnerScore / TV across verticals, or a safe SQL `LIMIT` of active managedomain rows — **read-only**).
2. Cap hard (suggest ≤ 500–2000 URLs) so sitemap generation stays fast.
3. Optional: `generateMetadata` on `/d/[domain]` already exists — ensure OG URL uses `https://www.ipartner.com` consistently; add OG image when Story 4 lands.
4. Do **not** invent a local domain sync table.

### Tables / functions (read-only)

| Table / function | Use |
| --- | --- |
| `domaindi_managedomain.domain` | Read active inventory only |
| `getVerticalBrandsByValue()` | Reuse for top-per-vertical candidates |
| `searchBrandsByQuery()` / `getBrandByDomain()` | Do not duplicate scoring logic |
| `domainPageHref()` | Canonical `/d/{domain}` paths |

### Acceptance

- [ ] `/sitemap.xml` includes multiple `/d/…` URLs.
- [ ] Inactive / sold domains never appear.
- [ ] Sitemap generation completes within a normal request budget.
- [ ] No write to managedomain or `MarketPartnership`.

---

## Story 6 — Domain CTA polish + portal home shells

**Owner:** Jayson · **P1** · **2 points**

### Do

1. **`DomainPartnershipView.tsx` (public variant):** clearer primary CTA hierarchy; sticky mobile apply bar (portal already has one); optional short “what to include” hint before `/apply?domain=…`.
2. Link vertical brand cards and search hits stay on `/d/{domain}` (already wired — verify no regressions).
3. **`src/app/portal/page.tsx`:** replace empty “Contracts / Invitations” dashed shells with either real empty states that link to Discover / Deals / Placements, or hide until built — no “Coming soon” next to live checkout.

No new tables. No inline full apply form required this sprint (deep-link to `/apply` is fine).

### Acceptance

- [ ] Public `/d/dogstream.com` (or any live domain) has an obvious Apply path on mobile.
- [ ] Portal home has no dangling “coming soon” cards that undercut live placements.
- [ ] Andre-era brand tokens preserved (`--ipp-*`).

---

## Story 7 — Admin AI `needs_info` draft email

**Owner:** Joseph · **P2** · **2 points**  
**UI assist (optional):** Jayson if queue/detail hierarchy needs a clearer send panel.

### Already live

- `src/lib/engagement-review.ts` — AI + heuristics; persists `role=reviewer` on `ipp_agent_message`.
- `/admin` — ReviewSweep, verdict filters.
- `/admin/engagement/[id]` — ReviewCard + re-screen.
- Cron `/api/cron/review-pending` daily 05:00 UTC.

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
3. `domaindi_managedomain.*` is read-only.
4. Own tables are `ipp_*` only.
5. No schema change planned. If one is required: amend this doc first → additive SQL under `prisma/migrations/` →

```bash
pnpm run db:check prisma/migrations/<file>.sql
pnpm run db:apply prisma/migrations/<file>.sql
pnpm exec prisma generate
```

---

## Blockers

**Analytics (Joseph):**

- [ ] `NEXT_PUBLIC_GA_ID`.

**Proof (Jayson):**

- [ ] Approved logos, names/titles, quotes, metric sources.
- [ ] Decision on Jordan P. quote.

If proof is late: factual process + sample-report UI only — no fake testimonials.

---

## Daily plan

### Mon Sep 7

- Joseph: `marketing-analytics.ts` + match/apply events.
- Jayson: collect approved proof assets; sketch proof + sample-report layout.

### Tue Sep 8

- Joseph: checkout/payment events + GA4 DebugView.
- Jayson: typed proof content + homepage section.
- **Proof approval cutoff: noon.**

### Wed Sep 9

- Joseph: stale checkout/drip/support copy pass.
- Jayson: sample Silver report + pricing link; start OG image.

### Thu Sep 10

- Joseph: `/d/*` sitemap; start `needs_info` draft if P0 done.
- Jayson: domain CTA polish + portal home empty states; funnel visual QA.

### Fri Sep 11

- Joseph: finish `needs_info` or park as stretch; full quality gate.
- Jayson: OG sign-off + cross-device QA checklist.
- Shared: smoke funnel; private release note (no secrets).

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
5. `/d/dogstream.com` (or known active domain) + search for that name in Discover / `/verticals`.
6. `/sitemap.xml` includes at least one `/d/…` URL.
7. GA4 DebugView shows four non-PII events.
8. `/admin` — AI verdicts visible; Confirm AI-approve still requires reason + CONFIRM.

---

## Definition of done

- [ ] Every committed P0 criterion passes.
- [ ] No new DB table unless this doc was amended first.
- [ ] No write to `MarketPartnership` or managedomain.
- [ ] No secret in git or this doc.
- [ ] Build, typecheck, lint, and preview funnel smoke pass.
- [ ] Jayson signs off UI mobile + desktop.
- [ ] Joseph signs off analytics, stale-copy, and sitemap acceptance.
- [ ] Product owner approves public proof before production.

---

## Out of scope this sprint

- AI email-management redesign (beyond Story 3/7 copy + needs-info draft).
- AI live support / support inbox rebuild.
- Public sponsor directory / CMS.
- Live slot inventory booking.
- Sponsor renewal / upgrade automation.
- Full legacy-page brand rewrite.
- First-party marketing event database.
- Local VNOC domain sync table (live-read is correct).
- Any migration or write to legacy tables.
