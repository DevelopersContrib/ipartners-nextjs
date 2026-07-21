import "server-only";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// AWS SES sender (ported from handyman2026/src/lib/ses.ts — the established
// VNOC pattern). In dev, with no AWS creds, it logs instead of sending so the
// sign-in flow still works locally.

let cachedClient: SESClient | null = null;

function getClient(): SESClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  const region = process.env.AWS_REGION || "us-west-2";
  if (!cachedClient) {
    cachedClient = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedClient;
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

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
}

export async function sendEmail(
  opts: SendEmailArgs,
): Promise<{ sent: boolean; messageId?: string }> {
  const from = opts.from || process.env.SES_FROM_EMAIL || "no-reply@ipartners.com";
  const client = getClient();
  const toList = Array.isArray(opts.to) ? opts.to : [opts.to];

  if (!client) {
    console.log(`[ses] (dev, not sent) "${opts.subject}" → ${toList.join(", ")}`);
    return { sent: false };
  }

  try {
    const res = await client.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: toList },
        ReplyToAddresses: opts.replyTo
          ? Array.isArray(opts.replyTo)
            ? opts.replyTo
            : [opts.replyTo]
          : undefined,
        Message: {
          Subject: { Data: opts.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: opts.html, Charset: "UTF-8" },
            Text: { Data: opts.text || htmlToText(opts.html), Charset: "UTF-8" },
          },
        },
      }),
    );
    return { sent: true, messageId: res.MessageId };
  } catch (e) {
    console.error("[ses] send failed:", e);
    return { sent: false };
  }
}
