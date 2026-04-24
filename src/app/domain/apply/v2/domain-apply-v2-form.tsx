"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

function getContribFormUrl(domain: string) {
  return `https://www.contrib.com/forms/ipartner/${encodeURIComponent(domain)}`;
}

const DEFAULT_DOMAINS = ["ipartner.com", "partners.com"] as const;

type DomainOption = (typeof DEFAULT_DOMAINS)[number] | "other";

interface FormValues {
  selectedDomain: DomainOption;
  otherDomain: string;
  email: string;
  country: string;
  city: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  linkedIn: string;
  employer: string;
  interestedIndustry: string;
  timeCommitment: string;
  areasOfExpertise: string;
  /** Partnership essay — part 1 (Contrib / iPartner form) */
  ideasMonetization: string;
  resourcesBringing: string;
  resourcesToolsNeeded: string;
  /** Partnership essay — part 2 */
  partnershipGoalsShortLong: string;
  businessAdviceYoung: string;
  expectationsContrib: string;
}

const initialValues: FormValues = {
  selectedDomain: "ipartner.com",
  otherDomain: "",
  email: "",
  country: "",
  city: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  linkedIn: "",
  employer: "",
  interestedIndustry: "",
  timeCommitment: "",
  areasOfExpertise: "",
  ideasMonetization: "",
  resourcesBringing: "",
  resourcesToolsNeeded: "",
  partnershipGoalsShortLong: "",
  businessAdviceYoung: "",
  expectationsContrib: "",
};

function getResolvedDomain(values: FormValues): string {
  if (values.selectedDomain === "other") {
    return values.otherDomain.trim() || "—";
  }
  return values.selectedDomain;
}

function formatDomainTitle(d: string) {
  if (!d || d === "—") return "Ipartner.com";
  const lower = d.trim().toLowerCase();
  const [name, ...restTld] = lower.split(".");
  const tld = restTld.length ? restTld.join(".") : "";
  if (!tld) return d;
  const nameCap = name ? name[0]!.toUpperCase() + name.slice(1) : "";
  return `${nameCap}.${tld}`;
}

const TOTAL_STEPS = 4;

export default function DomainApplyV2Form({
  defaultDomain,
}: {
  defaultDomain: string;
}) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>({
    ...initialValues,
    selectedDomain: (DEFAULT_DOMAINS as readonly string[]).includes(
      defaultDomain,
    )
      ? (defaultDomain as DomainOption)
      : "other",
    otherDomain: (DEFAULT_DOMAINS as readonly string[]).includes(defaultDomain)
      ? ""
      : defaultDomain,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const resolvedDomain = getResolvedDomain(values);
  const contribFormUrl = getContribFormUrl(
    resolvedDomain === "—" ? defaultDomain : resolvedDomain,
  );

  const update = <K extends keyof FormValues>(key: K, v: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key as string]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key as string];
        return n;
      });
    }
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (values.selectedDomain === "other" && !values.otherDomain.trim()) {
      e.otherDomain = "Please enter a domain name";
    }
    if (!values.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Invalid email";
    if (!values.country.trim()) e.country = "Required";
    if (!values.city.trim()) e.city = "Required";
    if (!values.firstName.trim()) e.firstName = "Required";
    if (!values.lastName.trim()) e.lastName = "Required";
    if (!values.password) e.password = "Required";
    else if (values.password.length < 8) e.password = "At least 8 characters";
    if (values.password !== values.confirmPassword)
      e.confirmPassword = "Passwords must match";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!values.interestedIndustry.trim()) e.interestedIndustry = "Required";
    if (!values.timeCommitment.trim()) e.timeCommitment = "Required";
    if (!values.areasOfExpertise.trim()) e.areasOfExpertise = "Required";
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!values.ideasMonetization.trim()) e.ideasMonetization = "Required";
    return e;
  };

  const goNext = () => {
    if (step === 1) {
      const e = validateStep1();
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(2);
      return;
    }
    if (step === 2) {
      const e = validateStep2();
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(3);
      return;
    }
    if (step === 3) {
      const e = validateStep3();
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const submitFinal = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/ipartner/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: resolvedDomain === "—" ? defaultDomain : resolvedDomain,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          country: values.country,
          city: values.city,
          phone: values.contactNumber,
          linkedIn: values.linkedIn,
          employer: values.employer,
          industry: values.interestedIndustry,
          timeCommitment: values.timeCommitment,
          areasOfExpertise: values.areasOfExpertise,
          ideasMonetization: values.ideasMonetization,
          resourcesBringing: values.resourcesBringing,
          resourcesToolsNeeded: values.resourcesToolsNeeded,
          partnershipGoalsShortLong: values.partnershipGoalsShortLong,
          businessAdviceYoung: values.businessAdviceYoung,
          expectationsContrib: values.expectationsContrib,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.success) {
        setSubmitError(json.error ?? "Failed to submit application");
        return;
      }
      setResultMessage(json.message ?? null);
      setSubmitted(true);
    } catch {
      setSubmitError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const onFormSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (step < 4) goNext();
    else void submitFinal();
  };

  const fieldClass =
    "w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 " +
    "placeholder:text-zinc-500 transition-all duration-200 " +
    "hover:border-emerald-500/30 focus:border-emerald-400/60 min-h-0 min-[768px]:min-h-[48px]";

  const essayTextareaClass =
    `${fieldClass} min-h-[160px] resize-y py-3 w-full ` + "leading-relaxed";

  const domainTitle = formatDomainTitle(resolvedDomain);
  const progressPct = (100 * step) / TOTAL_STEPS;

  if (submitted) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-emerald-950/20"
        id="apply-form"
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10" />
        <div className="relative text-center max-w-md mx-auto">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-2xl shadow-lg shadow-emerald-500/30">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Application received
          </h2>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            {resultMessage ??
              `We've saved your details for ${resolvedDomain}. Our team will follow up at ${values.email} shortly.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" id="apply-form">
      {/* Ambient orbs */}
      <div
        className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"
        aria-hidden
      />

      <form
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/50 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl shadow-black/50"
        onSubmit={onFormSubmit}
      >
        {/* Top gradient sheen */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
          aria-hidden
        />
        {/* Diagonal accent */}
        <div
          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 via-sky-500 to-violet-500 opacity-80"
          aria-hidden
        />

        <div className="relative pl-4 sm:pl-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-6">
            <div>
              {step <= 2 && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
                  Domain program
                </p>
              )}
              {step >= 3 && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/90">
                  Partnership
                </p>
              )}
              <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-white tracking-tight">
                {step >= 3
                  ? `Partner with ${domainTitle}`
                  : "Partner with iPartner"}
              </h2>
              {step <= 2 && (
                <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  We use this application to find aligned partners, filter for
                  fit, and grow the brands we build together. Take a minute to
                  tell us who you are and what you bring to the table.
                </p>
              )}
              {step === 3 && (
                <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  The purpose of this form is to filter and attract partners for
                  our premium venture opportunities, with the goal of forming a
                  mutually beneficial partnership that creates maximum value for
                  everyone involved.
                </p>
              )}
              {step === 4 && (
                <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  Welcome to Contrib and our iPartner form. The purpose of this
                  form is to filter and attract the best partners for our
                  premium venture opportunities, with the goal of forming a
                  mutually beneficial and benchmarkable partnership outline
                  agreement. Designing a plan that will create maximum value
                  with a mutually beneficial structure is our objective with the
                  following questions.
                </p>
              )}
            </div>
           
          </header>

          <nav
            className="flex items-center gap-2 mb-8"
            aria-label="Form progress"
          >
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-sky-500 to-sky-400"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>
            <span className="text-[11px] text-zinc-500 tabular-nums shrink-0">
              {step}/{TOTAL_STEPS}
            </span>
          </nav>
          <p className="sr-only">
            {step === 1 && "Step 1 of 4: account details"}
            {step === 2 && "Step 2 of 4: professional background"}
            {step === 3 && "Step 3 of 4: your ideas and resources"}
            {step === 4 && "Step 4 of 4: goals and expectations"}
          </p>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="domain-select"
                  >
                    Choose domain
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <select
                    id="domain-select"
                    className={fieldClass}
                    value={values.selectedDomain}
                    onChange={(e) =>
                      update("selectedDomain", e.target.value as DomainOption)
                    }
                  >
                    {DEFAULT_DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="other">Other…</option>
                  </select>
                  {values.selectedDomain === "other" && (
                    <div className="mt-3">
                      <label className="sr-only" htmlFor="other-domain">
                        Custom domain
                      </label>
                      <input
                        id="other-domain"
                        type="text"
                        placeholder="yourdomain.com"
                        className={fieldClass}
                        value={values.otherDomain}
                        onChange={(e) => update("otherDomain", e.target.value)}
                      />
                      {errors.otherDomain && (
                        <p className="mt-1.5 text-xs text-red-400" role="alert">
                          {errors.otherDomain}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-red-400/90">
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">
                      Domain(s) selected:
                    </span>{" "}
                    {resolvedDomain}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="email"
                  >
                    Email
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={fieldClass}
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="country"
                  >
                    Country
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    autoComplete="country-name"
                    className={fieldClass}
                    placeholder="Country"
                    value={values.country}
                    onChange={(e) => update("country", e.target.value)}
                  />
                  {errors.country && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="city"
                  >
                    City
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    className={fieldClass}
                    placeholder="City"
                    value={values.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                  {errors.city && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="firstName"
                  >
                    First name
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={fieldClass}
                    placeholder="First name"
                    value={values.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="lastName"
                  >
                    Last name
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={fieldClass}
                    placeholder="Last name"
                    value={values.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="password"
                  >
                    Password
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className={fieldClass}
                    placeholder="Password"
                    value={values.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={fieldClass}
                    placeholder="Confirm password"
                    value={values.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                  Next
                  <svg
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="contact"
                  >
                    Contact number
                  </label>
                  <input
                    id="contact"
                    type="tel"
                    autoComplete="tel"
                    className={fieldClass}
                    placeholder="+1 …"
                    value={values.contactNumber}
                    onChange={(e) => update("contactNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="linkedin"
                  >
                    LinkedIn profile
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    autoComplete="url"
                    className={fieldClass}
                    placeholder="https://linkedin.com/in/…"
                    value={values.linkedIn}
                    onChange={(e) => update("linkedIn", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="employer"
                  >
                    Current business / employer
                  </label>
                  <input
                    id="employer"
                    type="text"
                    className={fieldClass}
                    placeholder="Company or org"
                    value={values.employer}
                    onChange={(e) => update("employer", e.target.value)}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="industry"
                  >
                    Interested industry
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="industry"
                    type="text"
                    className={fieldClass}
                    placeholder="e.g. fintech, climate"
                    value={values.interestedIndustry}
                    onChange={(e) =>
                      update("interestedIndustry", e.target.value)
                    }
                  />
                  {errors.interestedIndustry && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.interestedIndustry}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="time"
                  >
                    Time commitment
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id="time"
                    type="text"
                    className={fieldClass}
                    placeholder="e.g. 5h / week"
                    value={values.timeCommitment}
                    onChange={(e) => update("timeCommitment", e.target.value)}
                  />
                  {errors.timeCommitment && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.timeCommitment}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="expertise"
                  >
                    Areas of expertise
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <textarea
                    id="expertise"
                    rows={4}
                    className={`${fieldClass} min-h-[120px] resize-y py-3`}
                    placeholder="What you’re known for, tools, and vertical experience…"
                    value={values.areasOfExpertise}
                    onChange={(e) => update("areasOfExpertise", e.target.value)}
                  />
                  {errors.areasOfExpertise && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.areasOfExpertise}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                  Next
                  <svg
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="ideas-monetization"
                  >
                    What are your ideas, concept, or monetization ideas?
                    <span className="text-red-500 ml-0.5" aria-hidden>
                      *
                    </span>
                  </label>
                  <textarea
                    id="ideas-monetization"
                    className={essayTextareaClass}
                    rows={5}
                    placeholder="Describe your ideas…"
                    value={values.ideasMonetization}
                    onChange={(e) =>
                      update("ideasMonetization", e.target.value)
                    }
                  />
                  {errors.ideasMonetization && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                      {errors.ideasMonetization}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="resources-bringing"
                  >
                    What resources/connections can/will you be bringing?
                  </label>
                  <textarea
                    id="resources-bringing"
                    className={essayTextareaClass}
                    rows={5}
                    placeholder="Networks, capital, audience, other assets…"
                    value={values.resourcesBringing}
                    onChange={(e) =>
                      update("resourcesBringing", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="resources-tools"
                  >
                    What resources and tools would you need to be a successful
                    partner?
                  </label>
                  <textarea
                    id="resources-tools"
                    className={essayTextareaClass}
                    rows={5}
                    placeholder="What would help you succeed in this partnership?"
                    value={values.resourcesToolsNeeded}
                    onChange={(e) =>
                      update("resourcesToolsNeeded", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                  Next
                  <svg
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="goals-short-long"
                  >
                    What would the short term and long term goals be with the
                    partnership?
                  </label>
                  <textarea
                    id="goals-short-long"
                    className={essayTextareaClass}
                    rows={5}
                    value={values.partnershipGoalsShortLong}
                    onChange={(e) =>
                      update("partnershipGoalsShortLong", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="business-advice"
                  >
                    Business advice you would give to young entrepreneurs?
                  </label>
                  <textarea
                    id="business-advice"
                    className={essayTextareaClass}
                    rows={5}
                    value={values.businessAdviceYoung}
                    onChange={(e) =>
                      update("businessAdviceYoung", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                    htmlFor="expectations-contrib"
                  >
                    What are your expectations from Contrib / Global Ventures?
                  </label>
                  <textarea
                    id="expectations-contrib"
                    className={essayTextareaClass}
                    rows={5}
                    value={values.expectationsContrib}
                    onChange={(e) =>
                      update("expectationsContrib", e.target.value)
                    }
                  />
                </div>
              </div>
              {submitError && (
                <p className="text-sm text-red-400" role="alert">
                  {submitError}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 min-h-0 min-[768px]:min-h-[48px] focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit"}
                  {!submitting && (
                    <svg
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
