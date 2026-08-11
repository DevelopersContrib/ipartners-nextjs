import { enrichEmailWithFullContact, isFullContactConfigured } from "@/lib/fullcontact";
import { manageAppPublishHref, STATUS_MEANING } from "@/lib/manage-handoff";

export default async function PublishAndEnrich({
  email,
  domain,
  engagementId,
  status,
}: {
  email: string;
  domain: string | null;
  engagementId: string;
  status: string;
}) {
  const enrich = await enrichEmailWithFullContact(email);
  const publishHref = manageAppPublishHref({ email, domain, engagementId });
  const meaning =
    STATUS_MEANING[status as keyof typeof STATUS_MEANING] || status;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--ipp-text)]">
          Activation / publish
        </h2>
        <p className="mb-3 text-xs leading-relaxed text-[var(--ipp-secondary)]">
          {meaning}. This app never writes{" "}
          <code className="font-mono">MarketPartnership</code> — publish the live widget in
          manage-app, then set status to <strong>active</strong> here.
        </p>
        {(status === "approved" || status === "pending") && (
          <ol className="mb-4 list-decimal space-y-1 pl-4 text-xs text-[var(--ipp-text)]">
            <li>Approve in iPartner when the partner is a good fit</li>
            <li>
              Open manage-app and publish the partnership / widget for this email
              {domain ? ` on ${domain}` : ""}
            </li>
            <li>Return here and mark <strong>active</strong> when live</li>
          </ol>
        )}
        <a
          href={publishHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-lg bg-[var(--ipp-primary)] px-4 text-sm font-semibold text-white"
        >
          Open manage-app publish
        </a>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--ipp-text)]">
          FullContact enrichment
        </h2>
        {!isFullContactConfigured() ? (
          <p className="text-xs text-[var(--ipp-secondary)]">
            Set <code className="font-mono">FULLCONTACT_API_KEY</code> to enrich applicants
            (same key pattern as Growagent).
          </p>
        ) : enrich.skipped ? (
          <p className="text-xs text-[var(--ipp-secondary)]">{enrich.reason}</p>
        ) : !enrich.ok ? (
          <p className="text-xs text-red-700">{enrich.reason || "Enrichment failed"}</p>
        ) : enrich.reason === "No FullContact match" ? (
          <p className="text-xs text-[var(--ipp-secondary)]">No FullContact match for this email.</p>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {enrich.fullName && (
              <div>
                <dt className="text-xs text-[var(--ipp-secondary)]">Name</dt>
                <dd>{enrich.fullName}</dd>
              </div>
            )}
            {enrich.title && (
              <div>
                <dt className="text-xs text-[var(--ipp-secondary)]">Title</dt>
                <dd>{enrich.title}</dd>
              </div>
            )}
            {enrich.organization && (
              <div>
                <dt className="text-xs text-[var(--ipp-secondary)]">Organization</dt>
                <dd>{enrich.organization}</dd>
              </div>
            )}
            {enrich.location && (
              <div>
                <dt className="text-xs text-[var(--ipp-secondary)]">Location</dt>
                <dd>{enrich.location}</dd>
              </div>
            )}
            {enrich.linkedin && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--ipp-secondary)]">LinkedIn</dt>
                <dd>
                  <a
                    href={enrich.linkedin}
                    className="break-all text-[var(--ipp-primary)] underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {enrich.linkedin}
                  </a>
                </dd>
              </div>
            )}
            {enrich.rawSummary && !enrich.fullName && (
              <p className="text-xs text-[var(--ipp-secondary)] sm:col-span-2">
                {enrich.rawSummary}
              </p>
            )}
          </dl>
        )}
      </section>
    </div>
  );
}
