'use client';

import { useState, useEffect } from 'react';
import type { PartnershipType } from '@/lib/types';
import { PARTNERSHIP_LABELS } from '@/lib/partnerships';

interface ApplicationFormProps {
  partnershipType: PartnershipType;
  domain?: string;
  inviteCode?: string;
  /** Known email (signed-in partner, or a verified DomainDirectory hand-off). */
  initialEmail?: string;
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
}: ApplicationFormProps) {
  // If we already know who they are, don't make them retype it — start at Profile.
  const [step, setStep] = useState(initialEmail ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [formOptions, setFormOptions] = useState<{
    roles: SelectOption[];
    industries: SelectOption[];
    experiences: SelectOption[];
    intentions: SelectOption[];
  }>({ roles: [], industries: [], experiences: [], intentions: [] });

  const [formData, setFormData] = useState<FormData>({
    email: initialEmail,
    firstname: '',
    lastname: '',
    domain: '',
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
      .then((data) => { if (data.countries) setCountries(data.countries); })
      .catch(() => {});

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => { if (data.formData) setFormOptions(data.formData); })
      .catch(() => {});
  }, []);

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
    setLoading(true);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          partnershipType,
          domain: formData.domain || domain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 sm:p-10">
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Application Submitted!</h2>
          <p className="text-[#8B9E93] leading-relaxed">
            Thank you for applying for a {PARTNERSHIP_LABELS[partnershipType]}.
            We&apos;ll review your application and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 border border-[#1E2D25] rounded-xl bg-[#0A0F0D] focus:bg-[#0D1210] text-white text-base transition-colors placeholder:text-[#5A6E62]';
  const labelClass = 'block text-sm font-medium text-[#8B9E93] mb-1.5';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 max-w-xs mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                    : 'bg-[#1A2420] text-[#5A6E62]'
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
              <span className={`text-xs mt-1.5 font-medium ${step >= s.num ? 'text-green-400' : 'text-[#5A6E62]'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-16 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                step > s.num ? 'bg-green-600' : 'bg-[#1E2D25]'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111916] rounded-2xl shadow-xl border border-[#1E2D25] p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          {PARTNERSHIP_LABELS[partnershipType]}
        </h2>
        <p className="text-sm text-[#5A6E62] mb-7">Step {step} of 3</p>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <p className="text-[#8B9E93] text-sm leading-relaxed">
              Enter your email to get started. Already have a Contrib account? Sign in to pre-fill your information.
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
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-500 transition-all font-semibold shadow-md shadow-green-600/20"
              >
                Continue
              </button>
              <a
                href={`/login?next=${encodeURIComponent(`/apply?type=${partnershipType}`)}`}
                className="flex-1 bg-[#1A2420] text-white border border-[#2A3D32] py-3.5 px-4 rounded-xl hover:bg-[#223029] transition-all font-semibold text-center"
              >
                Sign in
              </a>
            </div>
          </div>
        )}

        {/* Step 2 */}
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
            {partnershipType === 'domain' && (
              <div>
                <label htmlFor="domain" className={labelClass}>Domain Name</label>
                <input id="domain" name="domain" type="text" value={formData.domain} onChange={handleChange} className={inputClass} placeholder="example.com" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-[#1A2420] text-white border border-[#2A3D32] py-3.5 px-4 rounded-xl hover:bg-[#223029] transition-all font-semibold">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-500 transition-all font-semibold shadow-md shadow-green-600/20">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
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
              <button type="button" onClick={() => setStep(2)} className="flex-1 bg-[#1A2420] text-white border border-[#2A3D32] py-3.5 px-4 rounded-xl hover:bg-[#223029] transition-all font-semibold">
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-500 disabled:bg-green-800 transition-all font-semibold shadow-md shadow-green-600/20"
              >
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
