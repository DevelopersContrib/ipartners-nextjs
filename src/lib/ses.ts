import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let cachedClient: SESClient | null = null;

function getClient(): SESClient {
  if (cachedClient) return cachedClient;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region) throw new Error('AWS_REGION is not set');
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set');
  }
  cachedClient = new SESClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailArgs): Promise<{ messageId: string | undefined }> {
  const source = from ?? process.env.SES_FROM_EMAIL;
  if (!source) {
    throw new Error('SES_FROM_EMAIL is not set and no `from` override provided');
  }
  const client = getClient();
  const res = await client.send(
    new SendEmailCommand({
      Source: source,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      ReplyToAddresses: replyTo
        ? Array.isArray(replyTo)
          ? replyTo
          : [replyTo]
        : undefined,
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          ...(text ? { Text: { Data: text, Charset: 'UTF-8' } } : {}),
        },
      },
    })
  );
  return { messageId: res.MessageId };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
