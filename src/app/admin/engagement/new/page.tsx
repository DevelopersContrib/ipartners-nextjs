import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import EngagementForm from "../../EngagementForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New engagement — iPartner Admin",
  robots: { index: false, follow: false },
};

export default async function NewEngagementPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[var(--ipp-bg)] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-5">
        <Link href="/admin" className="text-sm text-[var(--ipp-secondary)] underline underline-offset-2">
          &larr; Back to engagements
        </Link>

        <header className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <h1 className="text-xl font-bold text-[var(--ipp-text)]">New engagement</h1>
          <p className="text-sm text-[var(--ipp-secondary)] mt-1">
            Create a partnership record in iPartner. This does not publish to the live domain widget.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <EngagementForm mode="create" />
        </section>
      </div>
    </main>
  );
}
