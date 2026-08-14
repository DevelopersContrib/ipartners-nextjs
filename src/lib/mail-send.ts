export {
  createAppSendEmail,
  emailConfigured,
  emailProvider,
  defaultFromEmail,
} from "@contrib/mail";

import { createAppSendEmail, defaultFromEmail as moduleDefaultFrom } from "@contrib/mail";

// iPartner is SES-only — never resolve the optional Resend package.
if (!process.env.EMAIL_PROVIDER?.trim()) {
  process.env.EMAIL_PROVIDER = "ses";
}

const IPP_FROM_FALLBACK = "hello@ipartner.com";

export function ippDefaultFromEmail(): string {
  return (
    process.env.SUPPORT_FROM_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.SES_FROM_EMAIL?.trim() ||
    moduleDefaultFrom(IPP_FROM_FALLBACK)
  );
}

/** @deprecated alias — prefer ippDefaultFromEmail */
export const rfDefaultFromEmail = ippDefaultFromEmail;

export const sendAppEmail = createAppSendEmail();
