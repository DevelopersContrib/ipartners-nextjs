import {
  sendSupportAutoresponder,
  type SupportAutoresponderInput,
} from "@contrib/support-autoresponder";
import { sendAppEmail, ippDefaultFromEmail, emailConfigured } from "@/lib/mail-send";

function rfConfig() {
  const support = ippDefaultFromEmail();
  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://www.ipartners.com"
  ).replace(/\/$/, "");

  return {
    siteName: process.env.SUPPORT_AUTORESPONDER_SITE_NAME || "iPartner",
    siteUrl,
    fromEmail: support,
    replyToEmail: support,
    supportEmail: support,
    enabled: process.env.SUPPORT_AUTORESPONDER !== "0" && emailConfigured(),
  };
}

export async function sendIppSupportAutoresponder(
  input: SupportAutoresponderInput
): Promise<void> {
  const r = await sendSupportAutoresponder(rfConfig(), input, sendAppEmail);
  if (r.ok === false) console.error("[support-autoresponder] rf failed", r.error);
}

export function queueSupportAutoresponder(input: SupportAutoresponderInput): void {
  void sendIppSupportAutoresponder(input);
}
