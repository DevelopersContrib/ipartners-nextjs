import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Referral Program - iPartner',
  description:
    'Refer founders, operators, and brands to the iPartner network and earn rewards for every partner who joins. Tracked end-to-end on Referrals.com.',
};

/**
 * The program itself lives on Referrals.com (campaigns, links, tracking,
 * anti-fraud, payouts). This page is the front door: the pitch, the rules,
 * and the embedded join widget.
 *
 * The reward schedule is defined on the Referrals.com campaign — the single
 * source of truth — so nothing here hardcodes amounts that could drift.
 */
const REFERRALS_URL = process.env.NEXT_PUBLIC_REFERRALS_URL || 'https://www.referrals.com';
const CAMPAIGN_ID = process.env.NEXT_PUBLIC_REFERRALS_CAMPAIGN_ID || '';

const steps = [
  {
    n: '1',
    title: 'Get your link',
    desc: 'Join the program and get a personal referral link — unique to you, tracked from first click.',
  },
  {
    n: '2',
    title: 'Refer someone great',
    desc: 'Founders who should own a category. Brands that belong in front of our audience. Operators ready to build.',
  },
  {
    n: '3',
    title: 'They join the network',
    desc: 'Your referral applies through iPartner. Our team reviews and approves every partnership personally.',
  },
  {
    n: '4',
    title: 'You earn',
    desc: 'When your referral becomes an approved partner, your reward is credited — tracked and paid through Referrals.com.',
  },
];

const faqs = [
  {
    q: 'What counts as a successful referral?',
    a: 'Someone who signs up through your link and becomes an approved iPartner partner — a published partnership, not just a submitted form. Quality referrals, not raw clicks.',
  },
  {
    q: 'How is tracking handled?',
    a: 'End-to-end on Referrals.com: every invite, click, signup, and conversion is attributed to your link, with built-in anti-fraud. Your dashboard shows live status for each referral.',
  },
  {
    q: 'Who can join the program?',
    a: 'Anyone. Existing iPartner partners, agencies, brokers, and community members are all welcome — partners tend to make the best referrers because they know what a good fit looks like.',
  },
  {
    q: 'Where do I see my rewards?',
    a: 'The current reward schedule and your earnings live in your Referrals.com dashboard, which you get access to the moment you join.',
  },
];

export default function ReferralsPage() {
  return (
    <div className="bg-[var(--ipp-bg)]">
      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--ipp-secondary)]">
            iPartner Referral Program
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ipp-text)]">
            Know someone who should
            <span className="text-[var(--ipp-primary)]"> own a category?</span>
          </h1>
          <p className="mt-5 text-lg text-[var(--ipp-secondary)] max-w-xl mx-auto">
            Refer founders, operators, and brands to the iPartner network. When they become a
            partner, you earn — tracked end-to-end, no spreadsheets, no chasing.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#join"
              className="px-6 py-3 rounded-xl bg-[var(--ipp-primary)] text-white text-sm font-semibold hover:brightness-110 transition"
            >
              Get my referral link
            </a>
            <Link
              href="/apply"
              className="px-6 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--ipp-text)] text-sm font-semibold hover:bg-white/70 transition"
            >
              I want to be the partner
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--ipp-secondary)]">
            Tracking &amp; payouts powered by Referrals.com · built-in anti-fraud
          </p>
        </div>
      </section>

      {/* What you're referring into */}
      <section className="px-4 pb-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--border)]">
          {[
            ['19,000+', 'active domains in the network'],
            ['54', 'categories open for partnership'],
            ['13 yrs', 'of partnerships behind the model'],
          ].map(([n, l]) => (
            <div key={l} className="bg-white px-4 py-6 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ipp-primary)] tabular-nums">{n}</div>
              <div className="mt-1 text-xs sm:text-sm text-[var(--ipp-secondary)]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ipp-text)] text-center">
            How it works
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="w-9 h-9 rounded-xl bg-[var(--ipp-accent)]/20 text-[var(--ipp-primary)] flex items-center justify-center text-sm font-bold">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-[var(--ipp-text)]">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--ipp-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join — the Referrals.com widget */}
      <section id="join" className="py-16 px-4 bg-white border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ipp-text)]">Join the program</h2>
            <p className="mt-3 text-[var(--ipp-secondary)]">
              Sign up below to get your personal link and see the current reward schedule.
            </p>
          </div>
          <div className="mt-8">
            {CAMPAIGN_ID ? (
              <iframe
                src={`${REFERRALS_URL}/widget/${CAMPAIGN_ID}/embed`}
                title="iPartner referral program signup"
                width="100%"
                height="560"
                style={{ border: 0 }}
                allow="clipboard-write"
                className="rounded-2xl border border-[var(--border)] bg-[var(--ipp-bg)]"
              />
            ) : (
              /* Campaign not provisioned yet — keep the page shippable without it. */
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--ipp-bg)] p-10 text-center">
                <p className="text-[var(--ipp-text)] font-semibold">The program is opening soon.</p>
                <p className="mt-2 text-sm text-[var(--ipp-secondary)] max-w-md mx-auto">
                  We&rsquo;re finishing setup on Referrals.com. Leave your email and we&rsquo;ll send
                  your referral link the day it opens.
                </p>
                <Link
                  href="/contact"
                  className="inline-block mt-5 px-6 py-3 rounded-xl bg-[var(--ipp-primary)] text-white text-sm font-semibold hover:brightness-110 transition"
                >
                  Notify me
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ipp-text)] text-center">
            Questions, answered
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-semibold text-[var(--ipp-text)]">{f.q}</h3>
                <p className="mt-2 text-sm text-[var(--ipp-secondary)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-[var(--ipp-secondary)]">
            Program terms, reward schedule, and payouts are administered on{' '}
            <a
              href={REFERRALS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--ipp-text)]"
            >
              Referrals.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
