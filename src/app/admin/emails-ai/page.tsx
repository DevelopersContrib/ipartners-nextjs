import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { IP_DOMAIN_KEY } from "@/lib/engagement";
import { prisma } from "@/lib/db";
import EmailsAiClient from "@/components/emails-ai/EmailsAiClient";

export const dynamic = "force-dynamic";

export default async function EmailsAiAdminPage() {
  await requireAdmin();

  const [segments, campaigns, enrollments, sends] = await Promise.all([
    prisma.engagement_segments.count({ where: { domain_key: IP_DOMAIN_KEY } }),
    prisma.engagement_campaigns.count({ where: { domain_key: IP_DOMAIN_KEY } }),
    prisma.engagement_enrollments.count({ where: { domain_key: IP_DOMAIN_KEY } }),
    prisma.engagement_sends.count({
      where: { enrollment: { domain_key: IP_DOMAIN_KEY } },
    }),
  ]);

  const campaignRows = await prisma.engagement_campaigns.findMany({
    where: { domain_key: IP_DOMAIN_KEY },
    orderBy: { created_at: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipp-primary)]">
            Nurture
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--ipp-text)]">Emails &amp; AI</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--ipp-secondary)]">
            Lifecycle drip campaigns for partners (<code className="text-xs">domain_key=
            {IP_DOMAIN_KEY}</code>
            ). Separate from Admin → Engagements (partnership triage).
          </p>
        </div>
        <Link
          href="/admin/support"
          className="text-sm font-semibold text-[var(--ipp-primary)] hover:underline"
        >
          Support Inbox →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Segments", segments],
          ["Campaigns", campaigns],
          ["Enrollments", enrollments],
          ["Sends", sends],
        ].map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-[var(--border)] bg-white p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ipp-secondary)]">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </div>
        ))}
      </div>

      <EmailsAiClient
        initialCampaigns={campaignRows.map((c) => ({
          id: c.id,
          campaign_key: c.campaign_key,
          name: c.name,
          segment_key: c.segment_key,
          enabled: c.enabled,
        }))}
      />
    </div>
  );
}
