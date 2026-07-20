import "server-only";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// AWS SES sender (ported from handyman2026/src/lib/ses.ts — the established
// VNOC pattern). In dev, with no AWS creds, it logs instead of sending so the
// sign-in flow still works locally.

function getClient(): SESClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  return new SESClient({
    region: process.env.AWS_REGION || "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/** Crude HTML → text for the plain-text part. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ sent: boolean }> {
  const client = getClient();
  const from = opts.from || process.env.SES_FROM_EMAIL || "no-reply@ipartners.com";

  if (!client) {
    console.log(`[ses] (dev, not sent) "${opts.subject}" → ${opts.to}`);
    return { sent: false };
  }

  try {
    await client.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [opts.to] },
        Message: {
          Subject: { Data: opts.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: opts.html, Charset: "UTF-8" },
            Text: { Data: opts.text || htmlToText(opts.html), Charset: "UTF-8" },
          },
        },
      }),
    );
    return { sent: true };
  } catch (e) {
    console.error("[ses] send failed:", e);
    return { sent: false };
  }
}
