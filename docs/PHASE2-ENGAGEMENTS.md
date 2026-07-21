# Phase 2 — Unify partnerships into `ipp_engagement`

Spec for the next build step on ipartners.com. Written against the live database, July 2026.
Everything here was verified by querying production; the "gotchas" section exists because each
item listed there already caused a wrong assumption once.

---

## 1. Why

Today the four partnership types live in four separate tables with **no shared identity**. The same
person applying twice is two unrelated rows, and nothing links either to their `MarketPartnership`
placements. That blocks every partner-facing feature worth building.

Phase 2 introduces one new table — `ipp_engagement` — that represents *one partner holding one
partnership, in one mode, on one scope*. A partner can hold many. Everything later (sponsorship
billing, reporting, referrals) attaches to it.

**Phase 1 is already shipped** (passwordless auth, partner portal, DD hand-off, application prefill).
Do not rebuild it.

---

## 2. Hard rules — read before writing any migration

- 🔴 **NEVER run `prisma db push`, `prisma migrate dev`, or `prisma migrate deploy`.** This is a shared
  production database serving live sites. Prisma's migration engine will try to "fix" the 20+ legacy
  tables it doesn't own.
- ✅ Migrations are **hand-written additive SQL** in `prisma/migrations/`, applied with
  `scripts/db-apply.mjs`, which enforces `ALLOWED_PREFIXES = ["ipp_"]`. It refuses to touch anything
  not prefixed `ipp_`. Keep it that way.
- 🔴 **`MarketPartnership` is live and public.** It drives the partner widget rendering on ~30,000
  domains via `https://tools.contrib.com/cwidget/partners/?d={domain}`. A bad write is visible on the
  public internet immediately. Phase 2 **reads** it and never writes it.
- 🔴 Never `SELECT` password columns from `domain_social_*` or the crypto account tables into any
  payload.
- Prisma is pinned to **v6** (`prisma@^6.2.1`, `@prisma/client@^6.2.1`). **Do not upgrade to 7** — v7
  removed `url` from the datasource block and the whole VNOC estate is on 6.
- Legacy tables are modelled in `schema.prisma` for **read access only**. Adding a column to a legacy
  model is a schema-file change, never a migration.

---

## 3. Verified schema facts

Row counts as of 2026-07-21.

| Table | PK | Rows | Notes |
|---|---|---|---|
| `Members` | `MemberId` | 108,126 | Identity source. Auth resolves `EmailAddress` → `MemberId`. |
| `MarketPartnership` | `partner_id` | 81,352 | 51,874 approved · 47,916 `in_equity` · **live public widget** |
| `IPartner` | `ipartner_id` | 1,323 | 1,308 unreviewed (`status=0`). Generic/lander intake. |
| `iPartner_Domain` | `ipartner_domain_id` | 300 | Inbound domain owners. Richest intake. |
| `iPartner_AppLeader` | `ipartner_id` | 8 | Last write 2020-12-14 |
| `iPartner_VentureLeader` | `ipartner_id` | 12 | Last write 2024-04-08 |
| `iPartner_ProductService` | `ipartner_id` | 10 | Last write 2024-08-09 |
| `iPartner_Domainlist` | `id` | 4,966 | `owner_id` → `iPartner_Domain.ipartner_domain_id` |

Portfolio scope: **19,211 active NameBright domains**, 19,198 category-mapped across 54 categories
(source: `domaindi_managedomain`.`domain` JOIN `category`).

---

## 4. Gotchas — each of these has already bitten

1. **PK and column names differ per table.** The three "variant" tables use `ipartner_id`,
   `fname`/`lname`, and `app_status`. `iPartner_Domain` uses `ipartner_domain_id`,
   `first_name`/`last_name`, and `status`. Do not assume `id`/`email`/`status` anywhere.

2. **`country` has three different representations.**
   - `Members.Country` → a display **NAME**, `NOT NULL`, with dirty casing (`"United States"`,
     `"philippines"`)
   - `iPartner_Domain.country` → an **INT id**
   - other `iPartner_*` → a VARCHAR holding an id (`"147"`)

   `src/components/ApplicationForm.tsx` exports `resolveOption()` which handles all three. Reuse it;
   don't write a second one.

3. **`0` means "unanswered", not a valid id.** `iPartner_Domain.country` and `industry_id` are
   `NOT NULL INT`. Filter `> 0` before treating them as ids — see `src/lib/partner-profile.ts`.

4. **`IPartner.resources` is NOT metadata.** It's the free-text answer to *"What resources/connections
   can you bring?"*. 655 lander rows overload it with the literal string `channel:lander`; 621 are
   blank; only 32 hold real prose. **Do not parse it as structured data.**

5. **`IPartner` has no type column at all.** The documented `type:<value>` convention appears in
   **0 of 1,323 rows**. Once a submission lands there, nothing records which of the four tracks it
   came from. This is why `ipp_engagement.mode` must be set at write time going forward.

6. **`iPartner_Domainlist` is dirty.** Of 4,966 rows only **1,158 (23%)** are clean bare domains; the
   rest are emails, full URLs with query strings, and prose sentences. Validate before treating any of
   it as a domain.

7. **There is production test pollution.** At least one `IPartner` row has
   `http://localhost:3000/domain/apply` stored in `resources`, `concept_ideas`, and `time_commitment`.
   Backfill should skip obvious junk rather than propagate it.

---

## 5. The new table

Additive only, `ipp_` prefixed. Adjust types to taste but keep the shape.

```sql
CREATE TABLE ipp_engagement (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id     BIGINT NULL,               -- Members.MemberId when the email resolves
  email         VARCHAR(255) NOT NULL,     -- always present; join key when member_id is NULL
  mode          VARCHAR(32)  NOT NULL,     -- sponsor|builder|domain_owner|app|operator|vendor|referrer
  scope_type    VARCHAR(16)  NOT NULL DEFAULT 'domain',  -- domain|vertical|network
  scope_value   VARCHAR(255) NULL,         -- domain name, or category/vertical name
  status        VARCHAR(24)  NOT NULL DEFAULT 'pending', -- pending|approved|declined|active|lapsed
  tier          VARCHAR(32)  NULL,         -- bronze|silver|gold — sponsor mode only
  term_start    DATE NULL,
  term_end      DATE NULL,
  source_table  VARCHAR(64)  NULL,         -- provenance for the backfill
  source_id     BIGINT       NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  KEY idx_email (email),
  KEY idx_member (member_id),
  KEY idx_mode_status (mode, status),
  KEY idx_scope (scope_type, scope_value)
);
```

`uq_source` makes the backfill **idempotent** — re-running it must not duplicate rows.

---

## 6. Backfill mapping

| Source | → `mode` | → `scope_value` | → `status` |
|---|---|---|---|
| `MarketPartnership` | `builder` | `domain` | `approved=1` → `approved`, else `pending` |
| `IPartner` | `builder` | `domain_name` | `status=0` → `pending` |
| `iPartner_Domain` | `domain_owner` | `domain` | from `status` |
| `iPartner_AppLeader` | `app` | `domain` | from `app_status` |
| `iPartner_VentureLeader` | `operator` | `domain` | from `app_status` |
| `iPartner_ProductService` | `vendor` | `domain` | from `app_status` |

### ⚠️ Do not backfill anyone as `sponsor`

**No one has ever paid us.** `MarketPartnership` records equity and contribution partnerships, not
purchases. Mapping legacy rows to `sponsor` would fabricate revenue history and corrupt every future
report. The `sponsor` mode starts **empty** and is only written by Phase 3 checkout.

### Identity resolution

Resolve `email` → `Members.MemberId`. Where it doesn't resolve, leave `member_id` NULL and keep the
email — roughly 2 of 1,112 known partner ids don't resolve, and some partners applied under a
different address than their member record. **Never silently merge two accounts**; leave it for manual
linking.

---

## 7. Surfaces

**Partner portal** (`/portal`) — replace the current per-table union with a single engagements view:
mode, scope, status, and (later) tier and term. One partner, all their partnerships, one list.

**Admin — extend manage-app, do not rebuild.** A full iPartner admin already exists at
`/ipartner/{partners,submissions,invites,email}` with a complete backend in
`vnoc/manage-app/src/lib/ipartner-management.ts` (`listPartnersNew/Approved`, `listIpartner*`,
`getPartnerDetail`, `setPartnerStatus`, `addIpartnerToVnoc`, `publishApplicationToMarket`). Search,
pagination, detail view, and CSV export are wired.

The bottleneck is **not** missing CRUD — 1,308 applications sit unreviewed *despite* a working queue.
So build triage, not forms:

- **Priority ranking** of the pending queue — applicant quality, whether the requested domain is
  high-value, age. Reviewing the best 50 beats staring at 1,308.
- **FullContact enrichment**, already built at `vnoc-growagent/lib/fullcontact-enrich.ts`
  (`enrichPersonByEmail`). Reuse it. Treat a no-match as neutral, never as a decline.
- **Bulk approve/decline** with a confirm step.
- **Backlog metrics** — age distribution, approval rate, weekly throughput.

### 🔴 Approval quality gate

Each published partnership adds **$2,000** to a domain's Theoretical Value
(`manage-app/src/lib/theoretical-value.ts`, weight `partner: 2000`) — the same figure used in broker
packets. Bulk-approving 1,308 applications to clear the queue would inflate portfolio valuation by
~$2.6M of fiction. Triage must rank and enrich, **not** auto-approve.

---

## 8. Acceptance criteria

- [ ] `pnpm db:check` dry-run passes; `db-apply.mjs` rejects any non-`ipp_` statement
- [ ] After apply, legacy row counts **unchanged**: `MarketPartnership` 81,352 · `IPartner` 1,323 ·
      `Members` 108,126 · `iPartner_Domain` 300
- [ ] Backfill is idempotent — running it twice produces the same `ipp_engagement` count
- [ ] Zero rows with `mode='sponsor'` after backfill
- [ ] A known partner email returns all their engagements across modes in `/portal`
- [ ] An unknown email gets a clean empty state, not an error
- [ ] `npx tsc --noEmit` and `npx next build` both clean
- [ ] No `prisma migrate*` or `db push` in any script or CI step

---

## 9. Out of scope for Phase 2

Billing and subscriptions (Phase 3), sponsor reporting and widget hardening (Phase 4), tracked links
and commissions (Phase 5), public domain catalog (Phase 6).

Also unresolved, and **not** to be guessed at:

- Partnership terms — rev-share %, equity, term length, reversion if a partner stalls. Business call.
- Whether the four typed intakes get rebuilt as distinct forms or collapse into fewer tracks.
- Whether the upstream `POST /api/v1/partnerships` handler (on api.vnoc.com, not in any local repo)
  persists `partnership_type`. Unverified — check the handler before relying on it.
