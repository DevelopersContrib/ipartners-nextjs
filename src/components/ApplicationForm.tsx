'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PartnershipType } from '@/lib/types';
import { PARTNERSHIP_LABELS } from '@/lib/partnerships';
import type { EngagementMode } from '@/lib/engagement-modes';
import { VERTICALS } from '@/lib/verticals';
import { SPONSOR_TIERS } from '@/lib/admin-client';
import { FALLBACK_FORM_DATA, FALLBACK_COUNTRIES, resolveFormData } from '@/lib/form-options';

interface ApplicationFormProps {
  partnershipType: PartnershipType;
  domain?: string;
  inviteCode?: string;
  /** Known email (signed-in partner, or a verified DomainDirectory hand-off). */
  initialEmail?: string;
  /**
   * What we already know about them, from Members + any prior application.
   * country/industry may arrive as either an id ("147") or a name ("United
   * States") depending on which table they came from — resolveOption sorts it
   * out once the <select> options have loaded.
   */
  initialProfile?: {
    firstname?: string;
    lastname?: string;
    country?: string;
    industry?: string;
  };
  engagementMode?: EngagementMode;
  vertical?: string;
  tier?: string;
}

interface FormData {
  email: string;
  firstname: string;
  lastname: string;
  domain: string;
  country: string;
  role: string;
  industry: string;
  experience: string;
  intention: string;
  message: string;
}

interface SelectOption {
  id: string;
  name: string;
}

/**
 * Our stored country/industry values are a mix of ids ("147", from the iPartner
 * tables) and names ("United States" / "philippines", from Members). The
 * <select> is keyed by id, so try id first, then match the name
 * case-insensitively. Returns '' when nothing matches — silently prefilling an
 * unmatched value would leave a blank required field the partner may not spot.
 */
export function resolveOption(raw: string | undefined, options: SelectOption[]): string {
  const v = (raw || '').trim();
  if (!v || options.length === 0) return '';
  const byId = options.find((o) => String(o.id) === v);
  if (byId) return String(byId.id);
  const lower = v.toLowerCase();
  const byName = options.find((o) => o.name.trim().toLowerCase() === lower);
  return byName ? String(byName.id) : '';
}

const steps = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Profile' },
  { num: 3, label: 'Details' },
];

export default function ApplicationForm({
  partnershipType,
  domain = 'ipartner.com',
  inviteCode,
  initialEmail = '',
  initialProfile,
  engagementMode,
  vertical,
  tier,
}: ApplicationFormProps) {
  const router = useRouter();
  // If we already know who they are, don't make them retype it — start at Profile.
  const [step, setStep] = useState(initialEmail ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sponsorVertical, setSponsorVertical] = useState(vertical || '');
  const [sponsorTier, setSponsorTier] = useState(tier || '');
  const [countries, setCountries] = useState<SelectOption[]>(FALLBACK_COUNTRIES);
  const [formOptions, setFormOptions] = useState(FALLBACK_FORM_DATA);

  const [formData, setFormData] = useState<FormData>({
    email: initialEmail,
    firstname: initialProfile?.firstname || '',
    lastname: initialProfile?.lastname || '',
    domain: domain && domain !== 'ipartner.com' ? domain : '',
    country: '',
    role: '',
    industry: '',
    experience: '',
    intention: '',
    message: '',
  });

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.countries) && data.countries.length > 0) {
          setCountries(
            data.countries
              .map((c: { id?: string; name?: string }, i: number) => ({
                id: String(c.id || i + 1),
                name: String(c.name || '').trim(),
              }))
              .filter((c: SelectOption) => c.name),
          );
        }
      })
      .catch(() => {});

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setFormOptions(resolveFormData(data?.formData));
      })
      .catch(() => {
        setFormOptions(FALLBACK_FORM_DATA);
      });
  }, []);

  // Resolve the known country/industry once their option lists have loaded.
  // Only fills fields the partner hasn't touched, so this never clobbers an edit.
  const profileCountry = initialProfile?.country;
  const profileIndustry = initialProfile?.industry;
  useEffect(() => {
    if (!profileCountry && !profileIndustry) return;
    setFormData((prev) => {
      const country = prev.country || resolveOption(profileCountry, countries);
      const industry = prev.industry || resolveOption(profileIndustry, formOptions.industries);
      if (country === prev.country && industry === prev.industry) return prev;
      return { ...prev, country, industry };
    });
  }, [countries, formOptions.industries, profileCountry, profileIndustry]);

  useEffect(() => {
    if (!inviteCode) return;
    fetch(`/api/invite?id=${encodeURIComponent(inviteCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invite) {
          setFormData((prev) => ({
            ...prev,
            email: data.invite.email || prev.email,
            firstname: data.invite.firstname || prev.firstname,
            lastname: data.invite.lastname || prev.lastname,
          }));
        }
      })
      .catch(() => {});
  }, [inviteCode]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (engagementMode === 'sponsor') {
      if (!sponsorVertical.trim()) {
        alert('Please select a vertical for sponsor interest.');
        return;
      }
      if (!sponsorTier.trim()) {
        alert('Please select a sponsorship tier.');
        return;
      }
    }
    setLoading(true);
    try {
      const referralSource =
        typeof document !== 'undefined'
          ? document.cookie
              .split('; ')
              .find((r) => r.startsWith('ipp_ref='))
              ?.split('=')
              .slice(1)
              .join('=')
          : undefined;

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          partnershipType,
          domain: formData.domain || domain,
          mode: engagementMode,
          vertical: engagementMode === 'sponsor' ? sponsorVertical : vertical,
          tier: engagementMode === 'sponsor' ? sponsorTier : tier,
          referral_source: referralSource
            ? decodeURIComponent(referralSource)
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
      const next = typeof data.next === 'string' ? data.next : '/portal/deals?applied=1';
      // Land signed-in partners on Deals; login redirect handles guests.
      window.setTimeout(() => router.push(next), 1200);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
        <div className="bg-white border border-[var(--ipp-primary)]/15 rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 bg-[var(--ipp-accent)]/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-[var(--ipp-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--ipp-text)] mb-3">Application Submitted!</h2>
          <p className="text-[var(--ipp-secondary)] leading-relaxed">
            Thank you for applying
            {engagementMode === 'sponsor' ? ' as a sponsor' : ` for a ${PARTNERSHIP_LABELS[partnershipType]}`}.
            Taking you to your deals…
          </p>
          <Link
            href="/portal/deals?applied=1"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--ipp-accent)] px-5 text-sm font-semibold text-[var(--ipp-text)]"
          >
            Go to Deals
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 border border-[var(--ipp-primary)]/20 rounded-xl bg-white focus:border-[var(--ipp-accent)] focus:outline-none text-[var(--ipp-text)] text-base transition-colors placeholder:text-[var(--ipp-secondary)]/60';
  const labelClass = 'block text-sm font-medium text-[var(--ipp-secondary)] mb-1.5';
  const btnPrimary =
    'flex-1 bg-[var(--ipp-accent)] text-white py-3.5 px-4 rounded-xl hover:opacity-90 transition-all font-semibold disabled:opacity-50';
  const btnSecondary =
    'flex-1 bg-white text-[var(--ipp-text)] border border-[var(--ipp-primary)]/20 py-3.5 px-4 rounded-xl hover:bg-[var(--ipp-bg)] transition-all font-semibold text-center';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0">
      <div className="flex items-center justify-between mb-10 max-w-xs mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-[var(--ipp-primary)] text-white'
                    : 'bg-[var(--ipp-primary)]/10 text-[var(--ipp-secondary)]'
                }`}
              >
                {step > s.num ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${step >= s.num ? 'text-[var(--ipp-primary)]' : 'text-[var(--ipp-secondary)]'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-16 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                step > s.num ? 'bg-[var(--ipp-primary)]' : 'bg-[var(--ipp-primary)]/15'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[var(--ipp-primary)]/10 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--ipp-text)] mb-1">
          {engagementMode === 'sponsor' ? 'Sponsor interest' : PARTNERSHIP_LABELS[partnershipType]}
        </h2>
        <p className="text-sm text-[var(--ipp-secondary)] mb-7">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-[var(--ipp-secondary)] text-sm leading-relaxed">
              Enter your email to get started. Already have an account? Sign in to pre-fill your information.
            </p>
            <div>
              <label htmlFor="email" className={labelClass}>Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className={btnPrimary}>
                Continue
              </button>
              <a
                href={`/login?next=${encodeURIComponent(`/apply?type=${partnershipType}${engagementMode ? `&mode=${engagementMode}` : ''}`)}`}
                className={btnSecondary}
              >
                Sign in
              </a>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className={labelClass}>First Name *</label>
                <input id="firstname" name="firstname" type="text" value={formData.firstname} onChange={handleChange} required className={inputClass} placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastname" className={labelClass}>Last Name *</label>
                <input id="lastname" name="lastname" type="text" value={formData.lastname} onChange={handleChange} required className={inputClass} placeholder="Doe" />
              </div>
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>Country *</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange} required className={inputClass}>
                <option value="">Select a country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {(partnershipType === 'domain' || engagementMode === 'sponsor') && (
              <div>
                <label htmlFor="domain" className={labelClass}>
                  {engagementMode === 'sponsor' ? 'Company or site (optional)' : 'Domain Name'}
                </label>
                <input id="domain" name="domain" type="text" value={formData.domain} onChange={handleChange} className={inputClass} placeholder="example.com" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className={btnSecondary}>
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className={btnPrimary}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {engagementMode === 'sponsor' && (
              <>
                <div>
                  <label htmlFor="sponsorVertical" className={labelClass}>
                    Vertical *
                  </label>
                  <select
                    id="sponsorVertical"
                    value={sponsorVertical}
                    onChange={(e) => setSponsorVertical(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a vertical</option>
                    {VERTICALS.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sponsorTier" className={labelClass}>
                    Sponsorship tier *
                  </label>
                  <select
                    id="sponsorTier"
                    value={sponsorTier}
                    onChange={(e) => setSponsorTier(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select tier</option>
                    {SPONSOR_TIERS.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--ipp-secondary)]">
                    Checkout is not live yet — this registers sponsor interest for follow-up.
                  </p>
                </div>
              </>
            )}
            <div>
              <label htmlFor="role" className={labelClass}>Role *</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClass}>
                <option value="">Select a role</option>
                {formOptions.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className={labelClass}>Industry</label>
                <select id="industry" name="industry" value={formData.industry} onChange={handleChange} className={inputClass}>
                  <option value="">Select industry</option>
                  {formOptions.industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="experience" className={labelClass}>Experience</label>
                <select id="experience" name="experience" value={formData.experience} onChange={handleChange} className={inputClass}>
                  <option value="">Select level</option>
                  {formOptions.experiences.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="intention" className={labelClass}>Intention</label>
              <select id="intention" name="intention" value={formData.intention} onChange={handleChange} className={inputClass}>
                <option value="">Select intention</option>
                {formOptions.intentions.map((int) => <option key={int.id} value={int.id}>{int.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>Message (optional)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className={btnSecondary}>
                Back
              </button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
