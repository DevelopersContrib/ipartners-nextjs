import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getPartnerProfile } from "@/lib/partner-profile";
import { getTrafficForDomains, formatVisitors } from "@/lib/partner-traffic";
import EngagementForm from "../../EngagementForm";
import RowActions from "./RowActions";
import DeleteButton from "./DeleteButton";
import CampaignSends from "./CampaignSends";
import PublishAndEnrich from "./PublishAndEnrich";
import SponsorInvoiceButton from "./SponsorInvoiceButton";
import AgentThread from "./AgentThread";
import { getApplicationDetail } from "@/lib/application-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engagement — iPartner Admin",
  robots: { index: false, follow: false },
};

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EngagementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let engagementId: bigint;
  try {
    engagementId = BigInt(id);
  } catch {
    notFound();
  }

  const e = await prisma.ippEngagement.findUnique({ where: { id: engagementId } });
  if (!e) notFound();

  const [profile, siblings, traffic, member, campaignSends, application, agentMessages] =
    await Promise.all([
    getPartnerProfile(e.email),
    prisma.ippEngagement.findMany({
      where: { email: e.email, id: { not: engagementId } },
      orderBy: { id: "desc" },
      take: 12,
    }),
    e.scopeValue?.includes(".")
      ? getTrafficForDomains([e.scopeValue])
      : Promise.resolve({} as Awaited<ReturnType<typeof getTrafficForDomains>>),
    prisma.members.findFirst({
      where: { EmailAddress: e.email },
      select: { MemberId: true, SignupDate: true, LastLogin: true },
    }),
    prisma.ippCampaignSend.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    }),
    getApplicationDetail({
      email: e.email,
      sourceTable: e.sourceTable,
      sourceId: e.sourceId,
      applicationJson: e.applicationJson,
    }),
    prisma.ippAgentMessage.findMany({
      where: { engagementId },
      orderBy: { id: "asc" },
      take: 40,
      select: {
        role: true,
        content: true,
        metaJson: true,
        createdAt: true,
      },
    }),
  ]);

  const t = e.scopeValue ? traffic[e.scopeValue.toLowerCase()] : undefined;

  const field = (label: string, value: string | null | undefined) =>
    value ? (
      <div>
        <dt className="text-xs uppercase tracking-wider text-[var(--ipp-secondary)]">{label}</dt>
        <dd className="text-sm text-[var(--ipp-text)] mt-0.5 break-all">{value}</dd>
      </div>
    ) : null;

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-5">
        <Link href="/admin" className="text-sm text-[var(--ipp-secondary)] underline underline-offset-2">
          &larr; Back to engagements
        </Link>

        <header className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--ipp-text)] break-all">{e.email}</h1>
              <p className="text-sm text-[var(--ipp-secondary)] mt-1 capitalize">
                {e.mode.replace("_", " ")}
                {e.scopeValue && <span className="font-mono normal-case"> · {e.scopeValue}</span>}
                {e.tier && <span> · {e.tier}</span>}
                <span className="capitalize"> · {e.status}</span>
              </p>
              {member && (
                <p className="text-xs text-[var(--ipp-secondary)] mt-1">
                  Member #{String(member.MemberId)}
                  {member.SignupDate && ` · joined ${member.SignupDate.toISOString().slice(0, 10)}`}
                  {member.LastLogin && ` · last login ${member.LastLogin.toISOString().slice(0, 10)}`}
                </p>
              )}
              {!member && (
                <p className="text-xs text-amber-700 mt-1">
                  No Members record under this email — new to the network.
                </p>
              )}
            </div>
            <RowActions id={String(e.id)} status={e.status} />
          </div>
        </header>

        <PublishAndEnrich
          email={e.email}
          domain={e.scopeValue}
          engagementId={String(e.id)}
          status={e.status}
        />

        {e.mode === "sponsor" && (
          <SponsorInvoiceButton engagementId={String(e.id)} tier={e.tier} />
        )}

        <AgentThread
          messages={agentMessages.map((m) => ({
            role: m.role,
            content: m.content,
            metaJson: m.metaJson,
            createdAt: m.createdAt.toISOString(),
          }))}
        />

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-[var(--ipp-text)]">
            {application.title}
          </h2>
          <p className="mb-4 text-[11px] text-[var(--ipp-secondary)]">
            Source: {application.source}
          </p>
          {application.fields.length === 0 ? (
            <p className="text-sm text-[var(--ipp-secondary)]">
              No application answers on file for this engagement yet. New applies store a
              full payload; older rows may only have profile fields below.
            </p>
          ) : (
            <dl className="space-y-4">
              {application.fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs uppercase tracking-wider text-[var(--ipp-secondary)]">
                    {f.label}
                  </dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-[var(--ipp-text)]">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--ipp-text)] mb-4">Edit engagement</h2>
          <EngagementForm
            mode="edit"
            initial={{
              id: String(e.id),
              email: e.email,
              mode: e.mode,
              scopeType: e.scopeType,
              scopeValue: e.scopeValue || "",
              status: e.status,
              tier: e.tier || "",
              termStart: toDateInput(e.termStart),
              termEnd: toDateInput(e.termEnd),
            }}
          />
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <DeleteButton id={String(e.id)} />
          </div>
        </section>

        <CampaignSends
          engagementId={String(e.id)}
          sends={campaignSends.map((s) => ({
            campaignKey: s.campaignKey,
            sendStatus: s.sendStatus,
            providerId: s.providerId,
            error: s.error,
            createdAt: s.createdAt.toISOString(),
          }))}
        />

        {t && t.visitors30d > 0 && (
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--ipp-text)] mb-3">
              Live traffic on <span className="font-mono">{e.scopeValue}</span>
            </h2>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-[var(--ipp-text)] tabular-nums">
                  {formatVisitors(t.visitors30d)}
                </p>
                <p className="text-xs text-[var(--ipp-secondary)]">visitors / 30d</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--ipp-text)] tabular-nums">
                  {formatVisitors(t.pageviews30d)}
                </p>
                <p className="text-xs text-[var(--ipp-secondary)]">pageviews / 30d</p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--ipp-text)] mb-3">Who they are</h2>
          {profile.source === "none" ? (
            <p className="text-sm text-[var(--ipp-secondary)]">
              Nothing on file beyond the email yet.
            </p>
          ) : (
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {field("Name", [profile.firstname, profile.lastname].filter(Boolean).join(" "))}
              {field("Company", profile.company)}
              {field("Phone", profile.phone)}
              {field("Country", profile.country)}
              {field("Industry", profile.industry)}
              {field("Source", profile.source)}
            </dl>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--ipp-text)] mb-3">
            Other engagements under this email
            <span className="text-[var(--ipp-secondary)] font-normal"> · {siblings.length}</span>
          </h2>
          {siblings.length === 0 ? (
            <p className="text-sm text-[var(--ipp-secondary)]">This is their first.</p>
          ) : (
            <ul className="space-y-2">
              {siblings.map((s) => (
                <li key={String(s.id)} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Link
                    href={`/admin/engagement/${s.id}`}
                    className="font-medium text-[var(--ipp-text)] capitalize hover:underline underline-offset-2"
                  >
                    {s.mode.replace("_", " ")}
                  </Link>
                  {s.scopeValue && (
                    <span className="font-mono text-xs text-[var(--ipp-secondary)]">{s.scopeValue}</span>
                  )}
                  <span className="text-xs text-[var(--ipp-secondary)] capitalize ml-auto">{s.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-[var(--ipp-secondary)]">
          Provenance: {e.sourceTable ? `${e.sourceTable} #${String(e.sourceId ?? "—")}` : "created in iPartner"}.
          Edits here update <code className="font-mono">ipp_engagement</code> only — publishing to the
          live widget stays a separate manage-app step.
        </p>
      </div>
    </main>
  );
}
