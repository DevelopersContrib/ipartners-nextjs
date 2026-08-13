# Handoff: Support Inbox + Emails & AI (iPartner)

Ported from `referrals-next` (Handyman-origin pattern). This doc is for iPartner developers to finish ops, polish UI, and ship safely on shared `contrib_rdb`.

## What shipped in code

| Area | Path / notes |
|------|----------------|
| Support tables | `ipp_support_tickets`, `ipp_support_ticket_messages` |
| Drip / Emails & AI tables | `ipp_drip_*` (Prisma models still named `engagement_*` with `@@map`) |
| Isolation keys | Support `site = 'ipartner'`; drip `domain_key = 'ipartner'`; ticket ids `IP-#####` |
| Admin Support Inbox | `/admin/support`, `/admin/support/[id]` |
| Admin Emails & AI | `/admin/emails-ai` (**not** `/admin/engagement` — that is partnership triage) |
| Contact → ticket | `/contact` + `POST /api/contacts` (replaces DomainDirectory iframe) |
| Inbound webhook | `POST /api/webhooks/support-inbound` |
| Cloudflare worker | `workers/support-inbound/` → deploy as `ipartner-support-inbound` |
| Portable modules | `modules/mail`, `modules/support-autoresponder`, `modules/engagement` |

**Naming collision (important):** existing Admin **Engagements** = partnership applications (`IppEngagement`). New **Emails & AI** = nurture drips. Keep both names distinct in UI and docs.

---

## 1) Database (required before UI works)

```bash
cd ipartners-nextjs
pnpm run db:check prisma/migrations/0007_ipp_support_drip.sql
pnpm run db:apply prisma/migrations/0007_ipp_support_drip.sql
pnpm prisma generate
```

Never `prisma db push` / `prisma migrate` against `contrib_rdb`.

---

## 2) Environment

Add to `.env` / Vercel (also documented in `.env.example`):

```env
# Support + AI
SUPPORT_FROM_EMAIL="hello@ipartner.com"
CONTACT_EMAIL="hello@ipartner.com"
SUPPORT_AUTORESPONDER="1"
SUPPORT_AUTORESPONDER_SITE_NAME="iPartner"
SUPPORT_AI_ENABLED="1"
OPENAI_API_KEY="…"                 # already used by help/fraud/agent
OPENAI_SUPPORT_MODEL="gpt-4o-mini" # optional
SUPPORT_INBOUND_WEBHOOK_SECRET="…" # long random hex; match worker secret

# Mail (existing SES vars are enough)
EMAIL_PROVIDER="ses"
# SES_FROM_EMAIL / AWS_* already present

# Emails & AI drip
ENGAGEMENT_ENABLED="1"
# ENGAGEMENT_VNOC_CAMPAIGN_ID=     # optional leadmail sync
# ENGAGEMENT_VNOC_DOMAIN_ID=       # numeric VNOC domain if known

# Optional VNOC support postbacks
# VNOC_ATTRIBUTION_URL="https://app.vnoc.com"
# VNOC_DOMAIN_ID="…"
# VNOC_IPARTNER_PRODUCT_ID="…"
# VNOC_IPARTNER_ATTRIBUTION_TOKEN="…"
```

---

## 3) Cloudflare inbound email (for replies to support@)

1. Deploy worker:
   ```bash
   cd workers/support-inbound
   pnpm install
   npx wrangler secret put SUPPORT_INBOUND_WEBHOOK_SECRET
   npx wrangler deploy
   ```
2. Set `WEBHOOK_URL` in `wrangler.toml` (default `https://www.ipartners.com/api/webhooks/support-inbound`).
3. Cloudflare Email Routing: `support@ipartner.com` (or chosen address) → **Send to Worker** `ipartner-support-inbound`.
4. Smoke: email support → appears in `/admin/support`; reply with `IP-#####` in subject threads.

Contact form + AI + staff outbound work **without** the worker; inbound email threading needs it.

---

## 4) Auth / identity notes

- Admin APIs use `getAdmin()` / `ADMIN_EMAILS` (same as rest of `/admin`).
- Ticket `member_id` → `Members.MemberId` when email matches; guests use `requester_email` only.
- Staff message `author_id` uses `admin.memberId` (may be `0` if admin email is not in Members yet).

---

## 5) Recommended next steps for the team

### Must-do before production traffic
1. Apply `0007_ipp_support_drip.sql` on prod `contrib_rdb`.
2. Set `SUPPORT_INBOUND_WEBHOOK_SECRET` + SES from-address verified for `ipartner.com`.
3. Deploy app + worker; verify:
   - `POST /api/contacts` creates ticket + autoresponder
   - AI reply when `OPENAI_API_KEY` set
   - Admin can reply from `/admin/support/[id]` (emails customer)
4. Click **Ensure default campaigns** on `/admin/emails-ai`.

### Product polish
- Portal **My tickets** UI (`/portal/support`) — member APIs can reuse `listMemberTickets` / `createMemberSupportTicket` from `src/lib/support-tickets.ts` (auth via `requirePartner()`).
- Expand Emails & AI UI (full Handyman/Referrals EngagementClient) if marketing wants segment enroll / AI rewrite — skeleton + ensure endpoint is in place.
- Rewrite engagement email copy in `engagement-email-templates.ts` for iPartner partnership journey (currently adapted from Referrals brand-manager tour).
- Admin dashboard KPI card linking to Support Inbox (optional).

### Do not
- Reuse `/admin/engagement` for drips.
- Create non-`ipp_` tables via `db:apply` (allowlist is `ipp_` only).
- Run Prisma migrate/push on shared RDS.

---

## 6) Key files map

```
prisma/migrations/0007_ipp_support_drip.sql
prisma/schema.prisma                 # support_* + engagement_* @@map → ipp_*
src/lib/support-*.ts
src/lib/support-member.ts            # Members.MemberId adapter
src/lib/mail-send.ts
src/lib/engagement*.ts
src/app/api/contacts/route.ts
src/app/api/webhooks/support-inbound/route.ts
src/app/api/admin/support/**
src/app/api/admin/emails-ai/ensure/route.ts
src/app/admin/support/**
src/app/admin/emails-ai/page.tsx
src/app/contact/page.tsx
src/components/contact/ContactTicketForm.tsx
src/components/admin/AdminShell.tsx  # nav links
workers/support-inbound/
modules/{mail,support-autoresponder,engagement}/
```

## 7) Reference implementations

- Referrals: `referrals-next` (`docs/PORTABLE-support-email.md`)
- Handyman: `handyman2026` Support + panel/engagement
- Portable DB guide: `modules/PORTABLE-DATABASE.md`

## 8) Smoke checklist

- [ ] Migration applied; `prisma generate` clean
- [ ] `/contact` creates `IP-#####` ticket
- [ ] Autoresponder email received
- [ ] AI first reply in thread (or escalate if no key)
- [ ] `/admin/support` lists ticket; staff reply emails customer
- [ ] Inbound worker 200 (not 401/405) after deploy
- [ ] `/admin/emails-ai` → Ensure defaults creates campaigns
- [ ] Confirm Admin → Engagements (partnerships) still unchanged
